import PDFDocument from 'pdfkit'
import fs  from 'fs'
import path from 'path'
// ==================== BASE CONFIGURATION ====================

const BASE_CONFIG = {
    pageSize: 'A4',
    margins: {
        left: 25,
        right: 25,
        top: 30,
        bottom: 30
    },
    colors: {
        primary: '#2C3E50',
        secondary: '#E67E22',
        text: '#333333',
        lightBg: '#F5F7FA',
        border: '#E0E0E0',
        white: '#FFFFFF'
    },
    fonts: {
        header: 'Helvetica-Bold',
        subheader: 'Helvetica-Bold',
        body: 'Helvetica',
        italic: 'Helvetica-Oblique'
    },
    spacing: {
        sectionGap: 15,
        itemGap: 8,
        bulletGap: 4
    }
};

// ==================== BASE CLASS ====================

class BaseResumeTemplate {
    constructor(config = {}) {
        this.config = this.mergeConfig(BASE_CONFIG, config);
        this.doc = new PDFDocument({
            size: this.config.pageSize,
            margin: 0,
            layout: 'portrait',
            bufferPages: true
        });
        
        this.pageWidth = this.doc.page.width;
        this.pageHeight = this.doc.page.height;
        this.margins = this.config.margins;
        
        // Content area
        this.contentWidth = this.pageWidth - this.margins.left - this.margins.right;
        this.contentHeight = this.pageHeight - this.margins.top - this.margins.bottom;
        
        // Page tracking
        this.currentPage = 1;
        this.currentY = this.margins.top;
    }

    mergeConfig(defaultConfig, userConfig) {
        const merged = { ...defaultConfig };
        for (let key in userConfig) {
            if (typeof userConfig[key] === 'object' && userConfig[key] !== null) {
                merged[key] = this.mergeConfig(defaultConfig[key] || {}, userConfig[key]);
            } else {
                merged[key] = userConfig[key];
            }
        }
        return merged;
    }

    // ==================== PAGE MANAGEMENT ====================

    checkPageBreak(requiredSpace, startY = this.currentY) {
        if (startY + requiredSpace > this.pageHeight - this.margins.bottom) {
            this.addNewPage();
            return true;
        }
        return false;
    }

    addNewPage() {
        this.doc.addPage();
        this.currentPage++;
        this.currentY = this.margins.top;
        this.onPageAdded();
    }

    onPageAdded() {
        // Override in templates
    }

    calculateTextHeight(text, options = {}) {
        const tempDoc = new PDFDocument({ margin: 0 });
        const width = options.width || this.contentWidth;
        const fontSize = options.fontSize || 10;
        const lineGap = options.lineGap || 2;
        
        tempDoc.fontSize(fontSize);
        return tempDoc.heightOfString(text, { width, lineGap }) + 2;
    }

    writeText(text, x, y, options = {}) {
        const width = options.width || this.contentWidth;
        const fontSize = options.fontSize || 10;
        const lineGap = options.lineGap || 2;
        
        const requiredHeight = this.calculateTextHeight(text, { width, fontSize, lineGap });
        
        this.doc
            .fillColor(options.color || this.config.colors.text)
            .fontSize(fontSize)
            .font(options.font || this.config.fonts.body)
            .text(text, x, y, {
                width: width,
                align: options.align || 'left',
                lineGap: lineGap
            });
        
        return requiredHeight;
    }

    writeSectionTitle(title, x, y) {
        this.doc
            .fillColor(this.config.colors.primary)
            .fontSize(14)
            .font(this.config.fonts.header)
            .text(title, x, y);
        
        return 18; // Height of section title
    }

    // ==================== MAIN GENERATION ====================

    generate(data, filename) {
        this.currentPage = 1;
        this.currentY = this.margins.top;
        
        const stream = this.doc.pipe(fs.createWriteStream(filename));
        
        this.generateSections(data);
        
        this.doc.end();
        
        stream.on('finish', () => {
            console.log(`✅ ${this.constructor.name} generated: ${filename} (${this.currentPage} page${this.currentPage > 1 ? 's' : ''})`);
        });
    }

    generateSections(data) {
        throw new Error('generateSections must be implemented');
    }
}

// ==================== TWO COLUMN MODERN TEMPLATE (FIXED) ====================

class TwoColumnModernTemplate extends BaseResumeTemplate {
    constructor(config = {}) {
        super(config);
        this.leftColWidth = 200;
        this.leftColX = this.margins.left;
        this.rightColX = this.leftColX + this.leftColWidth + 20;
        this.rightColWidth = this.pageWidth - this.rightColX - this.margins.right;
    }

    onPageAdded() {
        // Redraw left column background on every page
        this.doc
            .fillColor(this.config.colors.lightBg)
            .rect(0, 0, this.leftColWidth + this.margins.left, this.pageHeight)
            .fill();
        
        // Draw border
        this.doc
            .strokeColor(this.config.colors.border)
            .lineWidth(1)
            .moveTo(this.leftColWidth + this.margins.left, 0)
            .lineTo(this.leftColWidth + this.margins.left, this.pageHeight)
            .stroke();
    }

    generateSections(data) {
        // Draw left column background on first page
        this.onPageAdded();
        
        // Reset Y positions
        this.leftColY = this.margins.top;
        this.rightColY = this.margins.top;
        
        // ===== HEADER (Right Column) =====
        this.doc
            .fillColor(this.config.colors.primary)
            .fontSize(28)
            .font(this.config.fonts.header)
            .text(data.personalInfo.name, this.rightColX, this.rightColY);
        
        this.doc
            .fillColor(this.config.colors.secondary)
            .fontSize(14)
            .font(this.config.fonts.body)
            .text(data.personalInfo.title, this.rightColX, this.rightColY + 30);
        
        this.rightColY += 60;
        
        // ===== PROFILE (Right Column - MUST BE ON PAGE 1) =====
        const profileHeight = this.calculateTextHeight(data.summary, {
            width: this.rightColWidth,
            fontSize: 10,
            lineGap: 4
        });
        
        // Ensure profile fits on page 1
        if (this.rightColY + profileHeight + 30 > this.pageHeight - this.margins.bottom) {
            // If too tall, start on page 1 but continue on page 2
            const spaceLeft = this.pageHeight - this.margins.bottom - this.rightColY - 30;
            const firstPart = this.getPartialText(data.summary, spaceLeft, {
                width: this.rightColWidth,
                fontSize: 10,
                lineGap: 4
            });
            
            this.doc
                .fillColor(this.config.colors.text)
                .fontSize(10)
                .font(this.config.fonts.body)
                .text(firstPart.text, this.rightColX, this.rightColY, {
                    width: this.rightColWidth,
                    lineGap: 4
                });
            
            this.rightColY = this.pageHeight - this.margins.bottom + 20;
            this.addNewPage();
            
            // Continue profile on next page
            this.doc
                .fillColor(this.config.colors.text)
                .fontSize(10)
                .font(this.config.fonts.body)
                .text(firstPart.remaining, this.rightColX, this.rightColY, {
                    width: this.rightColWidth,
                    lineGap: 4
                });
            
            this.rightColY += this.calculateTextHeight(firstPart.remaining, {
                width: this.rightColWidth,
                fontSize: 10,
                lineGap: 4
            }) + 15;
        } else {
            // Profile fits on page 1
            this.doc
                .fillColor(this.config.colors.text)
                .fontSize(10)
                .font(this.config.fonts.body)
                .text(data.summary, this.rightColX, this.rightColY, {
                    width: this.rightColWidth,
                    lineGap: 4
                });
            
            this.rightColY += profileHeight + 15;
        }
        
        // ===== LEFT COLUMN SECTIONS =====
        this.leftColY = this.drawContact(data.contact, this.leftColX, this.leftColY);
        this.leftColY = this.drawEducation(data.education, this.leftColX, this.leftColY);
        this.leftColY = this.drawSkills(data.skills, this.leftColX, this.leftColY);
        this.leftColY = this.drawLanguages(data.languages, this.leftColX, this.leftColY);
        
        if (data.certificates && data.certificates.length) {
            this.leftColY = this.drawCertificates(data.certificates, this.leftColX, this.leftColY);
        }
        
        // ===== RIGHT COLUMN SECTIONS =====
        this.rightColY = this.drawExperience(data.experience, this.rightColX, this.rightColY);
        
        if (data.projects && data.projects.length) {
            this.rightColY = this.drawProjects(data.projects, this.rightColX, this.rightColY);
        }
        
        this.rightColY = this.drawReferences(data.references, this.rightColX, this.rightColY);
    }

    getPartialText(text, maxHeight, options) {
        const words = text.split(' ');
        let partial = '';
        let remaining = '';
        let currentHeight = 0;
        
        for (let i = 0; i < words.length; i++) {
            const testText = partial + (partial ? ' ' : '') + words[i];
            const height = this.calculateTextHeight(testText, options);
            
            if (height > maxHeight) {
                remaining = words.slice(i).join(' ');
                break;
            }
            
            partial = testText;
        }
        
        return { text: partial, remaining };
    }

    drawContact(data, x, startY) {
        let y = startY;
        
        // Section title
        this.doc
            .fillColor(this.config.colors.primary)
            .fontSize(14)
            .font(this.config.fonts.header)
            .text('CONTACT', x, y);
        
        y += 20;
        
        const items = [
            { icon: 'phone-solid-full.png', value: data.phone },
            { icon: 'envelope-solid-full.png', value: data.email },
            { icon: 'location-dot-solid-full.png', value: data.address },
            { icon: 'globe-solid-full.png', value: data.website }
        ];
        
        items.forEach(item => {
            // Check page break
            if (y + 20 > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
            }
            
            // Icon
            const iconPath = path.join(process.cwd(), 'public', 'Assets', item.icon);
            this.doc.image(iconPath, x, y, { width: 10 });
            // Value (with proper wrapping)
            const valueHeight = this.calculateTextHeight(item.value, {
                width: this.leftColWidth - 30,
                fontSize: 9,
                lineGap: 2

            });
            
            this.doc
                .fillColor(this.config.colors.text)
                .fontSize(9)
                .font(this.config.fonts.body)
                .text(item.value, x + 20, y + 3, {
                    width: this.leftColWidth - 30
                });
            
            y += Math.max(18, valueHeight + 2);
        });
        
        return y + 5;
    }

    drawEducation(education, x, startY) {
        let y = startY;
        
        // Section title
        this.doc
            .fillColor(this.config.colors.primary)
            .fontSize(14)
            .font(this.config.fonts.header)
            .text('EDUCATION', x, y);
        
        y += 20;
        
        education.forEach((edu) => {
            // Check page break
            if (y + 70 > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
            }
            
            // Year
            this.doc
                .fillColor(this.config.colors.secondary)
                .fontSize(10)
                .font(this.config.fonts.subheader)
                .text(edu.year, x, y);
            y += 12;
            
            // School
            this.doc
                .fillColor(this.config.colors.primary)
                .fontSize(11)
                .font(this.config.fonts.subheader)
                .text(edu.school, x, y);
            y += 12;
            
            // Degree
            this.doc
                .fillColor(this.config.colors.text)
                .fontSize(10)
                .font(this.config.fonts.body)
                .text(edu.degree, x, y);
            y += 12;
            
            // GPA
            if (edu.gpa) {
                this.doc
                    .fillColor(this.config.colors.text)
                    .fontSize(9)
                    .font(this.config.fonts.italic)
                    .text(edu.gpa, x, y);
                y += 15;
            } else {
                y += 8;
            }
            
            y += 5;
        });
        
        return y;
    }

        
    drawSkills(skills, startX, startY) {
        let y = startY;       
        let x = startX;
        
        // Title draw karo
        this.doc
            .fillColor(this.config.colors.primary)
            .fontSize(14)
            .font(this.config.fonts.header)
            .text('SKILLS', x, y); 
        
        y += 20;  

        const colWidth = this.leftColWidth - 30; 
        const bulletWidth = this.doc.widthOfString('• ');  

        skills.forEach((skill, index) => {
            const skillText = `${skill}`; 
            const skillWidth = this.doc.widthOfString(skillText);
            const totalItemWidth = bulletWidth + skillWidth; 

            
            if (x + totalItemWidth > startX + colWidth) {
                y += 15;        
                x = startX;      
            }

            this.doc
                .fillColor(this.config.colors.text)
                .fontSize(9)
                .font(this.config.fonts.body)
                .text(`• ${skill}`, x, y, {
                    lineBreak: false,  
                    continued: false
                });

            
            x = x + totalItemWidth + 10;  

            // Page break check (optional)
            if (y > this.pageHeight - this.margins.bottom - 20) {
                this.addNewPage();
                y = this.margins.top;  // New page pe top se shuru
                x = startX;  // X bhi reset karo
            }
        });
        
        // Last skill ke baad thoda space
        y += 20;
        return y;
    }




    drawLanguages(languages, x, startY) {
        let y = startY;
        
        // Section title
        this.doc
            .fillColor(this.config.colors.primary)
            .fontSize(14)
            .font(this.config.fonts.header)
            .text('LANGUAGES', x, y);
        
        y += 20;
        
        languages.forEach((lang) => {
            // Check page break
            if (y + 15 > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
            }
            
            this.doc
                .fillColor(this.config.colors.text)
                .fontSize(9)
                .font(this.config.fonts.body)
                .text(`• ${lang}`, x + 5, y, {
                    width: this.leftColWidth - 30
                });
            
            y += 15;
        });
        
        return y + 5;
    }

    drawCertificates(certificates, x, startY) {
        let y = startY;
        
        // Section title
        this.doc
            .fillColor(this.config.colors.primary)
            .fontSize(14)
            .font(this.config.fonts.header)
            .text('CERTIFICATES', x, y);
        
        y += 20;
        
        certificates.forEach((cert) => {
            // Check page break
            if (y + 15 > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
            }
            
            this.doc
                .fillColor(this.config.colors.text)
                .fontSize(8)
                .font(this.config.fonts.body)
                .text(`• ${cert}`, x + 5, y, {
                    width: this.leftColWidth - 30
                });
            
            y += 12;
        });
        
        return y + 5;
    }

    drawExperience(experiences, x, startY) {
        let y = startY;
        
        // Section title
        this.doc
            .fillColor(this.config.colors.primary)
            .fontSize(16)
            .font(this.config.fonts.header)
            .text('WORK EXPERIENCE', x, y);
        
        y += 25;
        
        experiences.forEach((exp) => {
            // Calculate height for this experience
            let expHeight = 40; // Company, date, position
            exp.responsibilities.forEach(resp => {
                expHeight += this.calculateTextHeight(`• ${resp}`, {
                    width: this.rightColWidth - 20,
                    fontSize: 9
                }) + 4;
            });
            
            // Check if we need a new page
            if (y + expHeight > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
            }
            
            // Company and date
            this.doc
                .fillColor(this.config.colors.primary)
                .fontSize(13)
                .font(this.config.fonts.subheader)
                .text(exp.company, x, y);
            
            const dateWidth = this.doc.widthOfString(exp.date);
            this.doc
                .fillColor(this.config.colors.secondary)
                .fontSize(11)
                .font(this.config.fonts.subheader)
                .text(exp.date, x + this.rightColWidth - dateWidth, y);
            
            y += 18;
            
            // Position
            this.doc
                .fillColor(this.config.colors.secondary)
                .fontSize(12)
                .font(this.config.fonts.italic)
                .text(exp.position, x, y);
            
            y += 18;
            
            // Responsibilities
            exp.responsibilities.forEach(resp => {
                const respHeight = this.calculateTextHeight(`• ${resp}`, {
                    width: this.rightColWidth - 20,
                    fontSize: 9
                });
                
                this.doc
                    .fillColor(this.config.colors.text)
                    .fontSize(9)
                    .font(this.config.fonts.body)
                    .text(`• ${resp}`, x + 10, y, {
                        width: this.rightColWidth - 20,
                        lineGap: 2
                    });
                
                y += respHeight + 4;
            });
            
            y += 15;
        });
        
        return y;
    }

    drawProjects(projects, x, startY) {
        let y = startY;
        
        // Section title
        this.doc
            .fillColor(this.config.colors.primary)
            .fontSize(16)
            .font(this.config.fonts.header)
            .text('PROJECTS', x, y);
        
        y += 25;
        
        projects.forEach((project) => {
            // Calculate height
            let projHeight = 15; // Name
            if (project.description) {
                projHeight += this.calculateTextHeight(project.description, {
                    width: this.rightColWidth,
                    fontSize: 9
                }) + 5;
            }
            if (project.technologies) {
                projHeight += 12;
            }
            
            // Check page break
            if (y + projHeight > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
            }
            
            // Project name
            this.doc
                .fillColor(this.config.colors.primary)
                .fontSize(12)
                .font(this.config.fonts.subheader)
                .text(project.name, x, y);
            y += 15;
            
            // Description
            if (project.description) {
                const descHeight = this.calculateTextHeight(project.description, {
                    width: this.rightColWidth,
                    fontSize: 9
                });
                
                this.doc
                    .fillColor(this.config.colors.text)
                    .fontSize(9)
                    .font(this.config.fonts.body)
                    .text(project.description, x, y, {
                        width: this.rightColWidth
                    });
                
                y += descHeight + 5;
            }
            
            // Technologies
            if (project.technologies) {
                this.doc
                    .fillColor(this.config.colors.secondary)
                    .fontSize(8)
                    .font(this.config.fonts.italic)
                    .text(`Tech: ${project.technologies}`, x, y);
                y += 12;
            }
            
            y += 10;
        });
        
        return y;
    }

    drawReferences(references, x, startY) {
        let y = startY;
        
        // Section title
        this.doc
            .fillColor(this.config.colors.primary)
            .fontSize(16)
            .font(this.config.fonts.header)
            .text('REFERENCES', x, y);
        
        y += 25;
        
        references.forEach((ref) => {
            // Calculate height
            const refHeight = 60;
            
            // Check page break
            if (y + refHeight > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
            }
            
            // Name
            this.doc
                .fillColor(this.config.colors.primary)
                .fontSize(12)
                .font(this.config.fonts.subheader)
                .text(ref.name, x, y);
            y += 15;
            
            // Title
            this.doc
                .fillColor(this.config.colors.secondary)
                .fontSize(11)
                .font(this.config.fonts.body)
                .text(ref.title, x, y);
            y += 12;
            
            // Phone
            this.doc
                .fillColor(this.config.colors.text)
                .fontSize(10)
                .font(this.config.fonts.body)
                .text(`Phone: ${ref.phone}`, x + 10, y);
            y += 12;
            
            // Email
            this.doc
                .fillColor(this.config.colors.text)
                .fontSize(10)
                .font(this.config.fonts.body)
                .text(`Email: ${ref.email}`, x + 10, y);
            y += 20;
        });
        
        return y;
    }
}

// ==================== SINGLE COLUMN CLASSIC TEMPLATE (FIXED) ====================

class SingleColumnClassicTemplate extends BaseResumeTemplate {
    constructor(config = {}) {
        super(config);
        this.contentX = this.margins.left;
        this.contentWidth = this.pageWidth - this.margins.left - this.margins.right;
    }

    generateSections(data) {
        // Reset Y
        this.currentY = this.margins.top;
        
        // ===== HEADER =====
        this.doc
            .fillColor(this.config.colors.primary)
            .fontSize(32)
            .font(this.config.fonts.header)
            .text(data.personalInfo.name, this.contentX, this.currentY, { 
                align: 'center',
                width: this.contentWidth
            });
        
        this.currentY += 35;
        
        this.doc
            .fillColor(this.config.colors.secondary)
            .fontSize(16)
            .font(this.config.fonts.body)
            .text(data.personalInfo.title, this.contentX, this.currentY, { 
                align: 'center',
                width: this.contentWidth
            });
        
        this.currentY += 25;
        
        // ===== CONTACT =====
        const contactText = `${data.contact.phone}  |  ${data.contact.email}  |  ${data.contact.address}  |  ${data.contact.website}`;
        
        this.doc
            .fillColor(this.config.colors.text)
            .fontSize(10)
            .font(this.config.fonts.body)
            .text(contactText, this.contentX, this.currentY, {
                align: 'center',
                width: this.contentWidth
            });
        
        this.currentY += 25;
        
        // Horizontal line
        this.doc
            .strokeColor(this.config.colors.border)
            .lineWidth(1)
            .moveTo(this.contentX, this.currentY - 5)
            .lineTo(this.contentX + this.contentWidth, this.currentY - 5)
            .stroke();
        
        // ===== PROFILE =====
        this.currentY = this.drawProfile(data.summary, this.currentY);
        
        // ===== WORK EXPERIENCE =====
        this.currentY = this.drawExperience(data.experience, this.currentY);
        
        // ===== EDUCATION =====
        this.currentY = this.drawEducation(data.education, this.currentY);
        
        // ===== SKILLS =====
        this.currentY = this.drawSkills(data.skills, this.currentY);
        
        // ===== LANGUAGES =====
        this.currentY = this.drawLanguages(data.languages, this.currentY);
        
        // ===== CERTIFICATES =====
        if (data.certificates && data.certificates.length) {
            this.currentY = this.drawCertificates(data.certificates, this.currentY);
        }
        
        // ===== PROJECTS =====
        if (data.projects && data.projects.length) {
            this.currentY = this.drawProjects(data.projects, this.currentY);
        }
        
        // ===== REFERENCES =====
        this.currentY = this.drawReferences(data.references, this.currentY);
    }

    drawProfile(text, startY) {
        let y = startY;
        
        // Section title
        this.doc
            .fillColor(this.config.colors.primary)
            .fontSize(16)
            .font(this.config.fonts.header)
            .text('PROFESSIONAL SUMMARY', this.contentX, y);
        
        y += 20;
        
        // Calculate height and check page break
        const textHeight = this.calculateTextHeight(text, {
            width: this.contentWidth,
            fontSize: 10,
            lineGap: 4
        });
        
        if (y + textHeight > this.pageHeight - this.margins.bottom) {
            const spaceLeft = this.pageHeight - this.margins.bottom - y;
            const firstPart = this.getPartialText(text, spaceLeft, {
                width: this.contentWidth,
                fontSize: 10,
                lineGap: 4
            });
            
            this.doc
                .fillColor(this.config.colors.text)
                .fontSize(10)
                .font(this.config.fonts.body)
                .text(firstPart.text, this.contentX, y, {
                    width: this.contentWidth,
                    lineGap: 4,
                    align: 'justify'
                });
            
            this.addNewPage();
            y = this.margins.top;
            
            this.doc
                .fillColor(this.config.colors.text)
                .fontSize(10)
                .font(this.config.fonts.body)
                .text(firstPart.remaining, this.contentX, y, {
                    width: this.contentWidth,
                    lineGap: 4,
                    align: 'justify'
                });
            
            y += this.calculateTextHeight(firstPart.remaining, {
                width: this.contentWidth,
                fontSize: 10,
                lineGap: 4
            }) + 20;
        } else {
            this.doc
                .fillColor(this.config.colors.text)
                .fontSize(10)
                .font(this.config.fonts.body)
                .text(text, this.contentX, y, {
                    width: this.contentWidth,
                    lineGap: 4,
                    align: 'justify'
                });
            
            y += textHeight + 20;
        }
        
        return y;
    }

    drawExperience(experiences, startY) {
        let y = startY;
        
        // Section title
        this.doc
            .fillColor(this.config.colors.primary)
            .fontSize(16)
            .font(this.config.fonts.header)
            .text('WORK EXPERIENCE', this.contentX, y);
        
        y += 25;
        
        experiences.forEach((exp) => {
            // Calculate total height needed
            let expHeight = 40;
            exp.responsibilities.forEach(resp => {
                expHeight += this.calculateTextHeight(`• ${resp}`, {
                    width: this.contentWidth - 20,
                    fontSize: 10
                }) + 4;
            });
            
            // Check page break
            if (y + expHeight > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
            }
            
            // Company and date
            this.doc
                .fillColor(this.config.colors.primary)
                .fontSize(14)
                .font(this.config.fonts.subheader)
                .text(exp.company, this.contentX, y);
            
            const dateWidth = this.doc.widthOfString(exp.date);
            this.doc
                .fillColor(this.config.colors.secondary)
                .fontSize(12)
                .font(this.config.fonts.subheader)
                .text(exp.date, this.contentX + this.contentWidth - dateWidth, y);
            
            y += 20;
            
            // Position
            this.doc
                .fillColor(this.config.colors.secondary)
                .fontSize(12)
                .font(this.config.fonts.italic)
                .text(exp.position, this.contentX, y);
            
            y += 18;
            
            // Responsibilities
            exp.responsibilities.forEach(resp => {
                const respHeight = this.calculateTextHeight(`• ${resp}`, {
                    width: this.contentWidth - 20,
                    fontSize: 10
                });
                
                this.doc
                    .fillColor(this.config.colors.text)
                    .fontSize(10)
                    .font(this.config.fonts.body)
                    .text(`• ${resp}`, this.contentX + 10, y, {
                        width: this.contentWidth - 20,
                        lineGap: 2
                    });
                
                y += respHeight + 4;
            });
            
            y += 20;
        });
        
        return y;
    }

    drawEducation(education, startY) {
        let y = startY;
        
        // Section title
        this.doc
            .fillColor(this.config.colors.primary)
            .fontSize(16)
            .font(this.config.fonts.header)
            .text('EDUCATION', this.contentX, y);
        
        y += 25;
        
        education.forEach((edu) => {
            // Check page break
            if (y + 80 > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
            }
            
            // School and year
            this.doc
                .fillColor(this.config.colors.primary)
                .fontSize(13)
                .font(this.config.fonts.subheader)
                .text(edu.school, this.contentX, y);
            
            const yearWidth = this.doc.widthOfString(edu.year);
            this.doc
                .fillColor(this.config.colors.secondary)
                .fontSize(11)
                .font(this.config.fonts.subheader)
                .text(edu.year, this.contentX + this.contentWidth - yearWidth, y);
            
            y += 18;
            
            // Degree
            this.doc
                .fillColor(this.config.colors.text)
                .fontSize(11)
                .font(this.config.fonts.body)
                .text(edu.degree, this.contentX + 10, y);
            y += 15;
            
            // GPA
            if (edu.gpa) {
                this.doc
                    .fillColor(this.config.colors.text)
                    .fontSize(9)
                    .font(this.config.fonts.italic)
                    .text(edu.gpa, this.contentX + 10, y);
                y += 18;
            } else {
                y += 10;
            }
        });
        
        return y;
    }

    drawSkills(skills, startY) {
        let y = startY;
        
        // Section title
        this.doc
            .fillColor(this.config.colors.primary)
            .fontSize(16)
            .font(this.config.fonts.header)
            .text('SKILLS', this.contentX, y);
        
        y += 25;
        
        // Skills in 3 columns
        const colWidth = (this.contentWidth - 40) / 3;
        
        skills.forEach((skill, index) => {
            const col = index % 3;
            const row = Math.floor(index / 3);
            const skillX = this.contentX + (col * (colWidth + 10));
            const skillY = y + (row * 18);
            
            // Check if we need a new page for next rows
            if (row > 0 && row % 20 === 0 && skillY > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
                // Recalculate on new page
                const newSkillY = y + ((index % 60) * 18);
                this.doc
                    .fillColor(this.config.colors.text)
                    .fontSize(10)
                    .font(this.config.fonts.body)
                    .text(`• ${skill}`, this.contentX + (col * (colWidth + 10)), newSkillY, {
                        width: colWidth
                    });
            } else {
                this.doc
                    .fillColor(this.config.colors.text)
                    .fontSize(10)
                    .font(this.config.fonts.body)
                    .text(`• ${skill}`, skillX, skillY, {
                        width: colWidth
                    });
            }
        });
        
        y += (Math.ceil(skills.length / 3) * 18) + 20;
        return y;
    }

    drawLanguages(languages, startY) {
        let y = startY;
        
        // Section title
        this.doc
            .fillColor(this.config.colors.primary)
            .fontSize(16)
            .font(this.config.fonts.header)
            .text('LANGUAGES', this.contentX, y);
        
        y += 25;
        
        languages.forEach((lang, index) => {
            if (index % 10 === 0 && y + 100 > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
            }
            
            this.doc
                .fillColor(this.config.colors.text)
                .fontSize(10)
                .font(this.config.fonts.body)
                .text(`• ${lang}`, this.contentX + 10, y, {
                    width: this.contentWidth - 20
                });
            
            y += 16;
        });
        
        return y;
    }

    drawCertificates(certificates, startY) {
        let y = startY;
        
        // Section title
        this.doc
            .fillColor(this.config.colors.primary)
            .fontSize(16)
            .font(this.config.fonts.header)
            .text('CERTIFICATIONS', this.contentX, y);
        
        y += 25;
        
        certificates.forEach((cert, index) => {
            if (index % 10 === 0 && y + 100 > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
            }
            
            this.doc
                .fillColor(this.config.colors.text)
                .fontSize(10)
                .font(this.config.fonts.body)
                .text(`• ${cert}`, this.contentX + 10, y, {
                    width: this.contentWidth - 20
                });
            
            y += 14;
        });
        
        return y;
    }

    drawProjects(projects, startY) {
        let y = startY;
        
        // Section title
        this.doc
            .fillColor(this.config.colors.primary)
            .fontSize(16)
            .font(this.config.fonts.header)
            .text('PROJECTS', this.contentX, y);
        
        y += 25;
        
        projects.forEach((project) => {
            // Calculate height
            let projHeight = 15;
            if (project.description) {
                projHeight += this.calculateTextHeight(project.description, {
                    width: this.contentWidth,
                    fontSize: 10
                }) + 5;
            }
            if (project.technologies) {
                projHeight += 15;
            }
            
            // Check page break
            if (y + projHeight > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
            }
            
            // Project name
            this.doc
                .fillColor(this.config.colors.primary)
                .fontSize(13)
                .font(this.config.fonts.subheader)
                .text(project.name, this.contentX, y);
            y += 15;
            
            // Description
            if (project.description) {
                const descHeight = this.calculateTextHeight(project.description, {
                    width: this.contentWidth,
                    fontSize: 10
                });
                
                this.doc
                    .fillColor(this.config.colors.text)
                    .fontSize(10)
                    .font(this.config.fonts.body)
                    .text(project.description, this.contentX, y, {
                        width: this.contentWidth
                    });
                
                y += descHeight + 5;
            }
            
            // Technologies
            if (project.technologies) {
                this.doc
                    .fillColor(this.config.colors.secondary)
                    .fontSize(9)
                    .font(this.config.fonts.italic)
                    .text(`Technologies: ${project.technologies}`, this.contentX, y);
                y += 15;
            }
            
            y += 10;
        });
        
        return y;
    }

    drawReferences(references, startY) {
        let y = startY;
        
        // Section title
        this.doc
            .fillColor(this.config.colors.primary)
            .fontSize(16)
            .font(this.config.fonts.header)
            .text('REFERENCES', this.contentX, y);
        
        y += 25;
        
        references.forEach((ref) => {
            // Calculate height
            const refHeight = 70;
            
            // Check page break
            if (y + refHeight > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
            }
            
            // Name
            this.doc
                .fillColor(this.config.colors.primary)
                .fontSize(13)
                .font(this.config.fonts.subheader)
                .text(ref.name, this.contentX, y);
            y += 15;
            
            // Title
            this.doc
                .fillColor(this.config.colors.secondary)
                .fontSize(11)
                .font(this.config.fonts.body)
                .text(ref.title, this.contentX, y);
            y += 12;
            
            // Phone
            this.doc
                .fillColor(this.config.colors.text)
                .fontSize(10)
                .font(this.config.fonts.body)
                .text(`Phone: ${ref.phone}`, this.contentX + 15, y);
            y += 12;
            
            // Email
            this.doc
                .fillColor(this.config.colors.text)
                .fontSize(10)
                .font(this.config.fonts.body)
                .text(`Email: ${ref.email}`, this.contentX + 15, y);
            y += 20;
            
            y += 5;
        });
        
        return y;
    }

    getPartialText(text, maxHeight, options) {
        const words = text.split(' ');
        let partial = '';
        let remaining = '';
        let currentHeight = 0;
        
        for (let i = 0; i < words.length; i++) {
            const testText = partial + (partial ? ' ' : '') + words[i];
            const height = this.calculateTextHeight(testText, options);
            
            if (height > maxHeight) {
                remaining = words.slice(i).join(' ');
                break;
            }
            
            partial = testText;
        }
        
        return { text: partial, remaining };
    }
}

// ==================== TEMPLATE FACTORY ====================

class ResumeTemplateFactory {
    static createTemplate(type, config = {}) {
        switch(type) {
            case 'two-column-modern':
                return new TwoColumnModernTemplate(config);
            case 'single-column-classic':
                return new SingleColumnClassicTemplate(config);
            default:
                throw new Error(`Unknown template type: ${type}`);
        }
    }
}

// ==================== SAMPLE DATA ====================

const sampleData = {
    personalInfo: {
        name: 'RICHARD SANCHEZ',
        title: 'MARKETING MANAGER'
    },
    contact: {
        phone: '+123-456-7890',
        email: 'hello@reallygreatsite.com',
        address: '123 Anywhere St., Any City, State 12345',
        website: 'www.reallygreatsite.com'
    },
    summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation. Ut enim ad minim veniam quis nostrud exercitation. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation.',
    education: [
        {
            year: '2029 - 2030',
            school: 'WARDIERE UNIVERSITY',
            degree: 'Master of Business Management'
        },
        {
            year: '2025 - 2029',
            school: 'WARDIERE UNIVERSITY',
            degree: 'Bachelor of Business',
            gpa: 'GPA: 3.8 / 4.0'
        }
    ],
    skills: [
        'Project Management', 'Public Relations', 'Teamwork', 'Time Management',
        'Leadership', 'Effective Communication', 'Critical Thinking', 'Strategic Planning',
        'Budget Management', 'Team Leadership', 'Market Analysis', 'Content Strategy',
        'SEO Optimization', 'Social Media Marketing', 'Email Campaigns', 'Analytics',
        'CRM Software', 'Adobe Creative Suite', 'Microsoft Office', 'Google Analytics'
    ],
    languages: [
        'English (Fluent)', 'French (Fluent)', 'German (Basics)', 'Spanish (Intermediate)',
        'Italian (Conversational)'
    ],
    certificates: [
        'Google Analytics Certified', 'HubSpot Content Marketing',
        'Project Management Professional (PMP)', 'Digital Marketing Certification',
        'SEO Mastery Course', 'Social Media Strategy', 'Email Marketing Certification'
    ],
    projects: [
        {
            name: 'Brand Redesign 2024',
            description: 'Led complete brand redesign for major client, resulting in 40% increase in engagement. Managed team of 5 designers.',
            technologies: 'Adobe Creative Suite, Figma'
        },
        {
            name: 'Marketing Automation Platform',
            description: 'Implemented HubSpot automation for lead generation, resulting in 200% increase in qualified leads.',
            technologies: 'HubSpot, CRM Integration'
        },
        {
            name: 'Social Media Campaign',
            description: 'Developed viral social media campaign reaching 1M+ users.',
            technologies: 'Meta Business Suite, Hootsuite'
        }
    ],
    experience: [
        {
            company: 'Borcelle Studio',
            position: 'Marketing Manager & Specialist',
            date: '2030 - PRESENT',
            responsibilities: [
                'Develop and execute comprehensive marketing strategies and campaigns that align with the company\'s goals and objectives.',
                'Lead, mentor, and manage a high-performing marketing team, fostering a collaborative and results-driven work environment.',
                'Monitor brand consistency across marketing channels and materials.',
                'Manage annual marketing budget of $2M, optimizing ROI across all campaigns.',
                'Coordinate with sales team to align marketing efforts with revenue goals.'
            ]
        },
        {
            company: 'Fauget Studio',
            position: 'Marketing Manager & Specialist',
            date: '2025 - 2029',
            responsibilities: [
                'Create and manage the marketing budget, ensuring efficient allocation of resources and optimizing ROI.',
                'Oversee market research to identify emerging trends, customer needs, and competitor strategies.',
                'Monitor brand consistency across marketing channels and materials.',
                'Developed content strategy that increased website traffic by 150%.',
                'Implemented marketing automation that reduced lead response time by 60%.'
            ]
        },
        {
            company: 'Studio Shodwe',
            position: 'Marketing Manager & Specialist',
            date: '2024 - 2025',
            responsibilities: [
                'Develop and maintain strong relationships with partners, agencies, and vendors to support marketing initiatives.',
                'Monitor and maintain brand consistency across all marketing channels and materials.',
                'Created and executed email marketing campaigns with 25% open rate.',
                'Managed social media presence across 5 platforms.'
            ]
        },

                {
            company: 'Studio Shodwe',
            position: 'Marketing Manager & Specialist',
            date: '2024 - 2025',
            responsibilities: [
                'Develop and maintain strong relationships with partners, agencies, and vendors to support marketing initiatives.',
                'Monitor and maintain brand consistency across all marketing channels and materials.',
                'Created and executed email marketing campaigns with 25% open rate.',
                'Managed social media presence across 5 platforms.'
            ]
        }

        
    ],
    references: [
        {
            name: 'Estelle Darcy',
            title: 'Wardiere Inc. / CTO',
            phone: '123-456-7890',
            email: 'hello@reallygreatsite.com'
        },
        {
            name: 'Harper Richard',
            title: 'Wardiere Inc. / CEO',
            phone: '123-456-7890',
            email: 'hello@reallygreatsite.com'
        },
        {
            name: 'Michael Chen',
            title: 'Borcelle Studio / Director',
            phone: '123-456-7891',
            email: 'michael@borcelle.com'
        }
    ]
};

// ==================== USAGE ====================

console.log('Generating resumes with proper spacing...');

// Generate modern two-column resume
const modernTemplate = ResumeTemplateFactory.createTemplate('two-column-modern');
modernTemplate.generate(sampleData, 'modern_resume_final.pdf');

// Generate classic single-column resume
const classicTemplate = ResumeTemplateFactory.createTemplate('single-column-classic');
classicTemplate.generate(sampleData, 'classic_resume_final.pdf');

console.log('✅ All resumes generated successfully!');