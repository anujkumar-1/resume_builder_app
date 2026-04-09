import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { Upload } from '@aws-sdk/lib-storage';
import { S3Client } from "@aws-sdk/client-s3";
import { PassThrough } from 'stream';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== AWS S3 CONFIGURATION ====================
const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY,
    },
});

// ==================== BASE CONFIGURATION ====================
const BASE_CONFIG = {
    pageSize: 'A4',
    margins: {
        left: 25,
        right: 25,
        top: 30,
        bottom: 30
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

// ==================== DEFAULT COLOR SCHEMES ====================
export const COLOR_SCHEMES = {
    professional: {
        primary: '#2C3E50',
        secondary: '#E67E22',
        text: '#333333',
        lightBg: '#F5F7FA',
        border: '#E0E0E0',
        white: '#FFFFFF'
    },
    elegant: {
        primary: '#1A1A2E',
        secondary: '#C4A484',
        text: '#2D2D2D',
        lightBg: '#F8F4F0',
        border: '#D4C5B0',
        white: '#FFFFFF'
    },
    modern: {
        primary: '#0F172A',
        secondary: '#3B82F6',
        text: '#1E293B',
        lightBg: '#F8FAFC',
        border: '#CBD5E1',
        white: '#FFFFFF'
    },
    creative: {
        primary: '#6B21A5',
        secondary: '#EC4899',
        text: '#1F2937',
        lightBg: '#FAF5FF',
        border: '#E9D5FF',
        white: '#FFFFFF'
    },
    corporate: {
        primary: '#1E3A8A',
        secondary: '#F59E0B',
        text: '#111827',
        lightBg: '#EFF6FF',
        border: '#BFDBFE',
        white: '#FFFFFF'
    },
    minimal: {
        primary: '#000000',
        secondary: '#666666',
        text: '#333333',
        lightBg: '#FAFAFA',
        border: '#EEEEEE',
        white: '#FFFFFF'
    }
};

// ==================== BASE CLASS ====================
class BaseResumeTemplate {
    constructor(colors, config = {}) {
        this.colors = colors;
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
        
        this.contentWidth = this.pageWidth - this.margins.left - this.margins.right;
        this.contentHeight = this.pageHeight - this.margins.top - this.margins.bottom;
        
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
            .fillColor(options.color || this.colors.text)
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
            .fillColor(this.colors.primary)
            .fontSize(14)
            .font(this.config.fonts.header)
            .text(title, x, y);
        
        return 18;
    }

    async uploadToS3(passThrough, fileName) {
        try {
            const upload = new Upload({
                client: s3Client,
                params: {
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Key: fileName,
                    Body: passThrough,
                    ContentType: 'application/pdf',
                    ACL: "public-read",
                },
            });

            const result = await upload.done();
            return result.Location;
        } catch (error) {
            console.error('S3 Upload Error:', error);
            throw new Error(`Failed to upload to S3: ${error.message}`);
        }
    }

    async generateAndUpload(data, fileName) {
        return new Promise(async (resolve, reject) => {
            try {
                this.currentPage = 1;
                this.currentY = this.margins.top;
                
                // Create a PassThrough stream
                const passThrough = new PassThrough();
                
                // Pipe PDF document to PassThrough stream
                this.doc.pipe(passThrough);
                
                // Generate PDF content
                this.generateSections(data);
                this.doc.end();
                
                // Upload to S3 and get URL
                const s3Url = await this.uploadToS3(passThrough, fileName);
                
                console.log(`✅ ${this.constructor.name} uploaded to S3: ${s3Url} (${this.currentPage} page${this.currentPage > 1 ? 's' : ''})`);
                resolve({ url: s3Url, pages: this.currentPage, fileName });
            } catch (error) {
                reject(error);
            }
        });
    }

    generateSections(data) {
        throw new Error('generateSections must be implemented');
    }
}

// ==================== TWO COLUMN MODERN TEMPLATE ====================
class TwoColumnModernTemplate extends BaseResumeTemplate {
    constructor(colors, config = {}) {
        super(colors, config);
        this.leftColWidth = 180;
        this.leftColX = this.margins.left;
        this.rightColX = this.leftColX + this.leftColWidth + 20;
        this.rightColWidth = this.pageWidth - this.rightColX - this.margins.right;
    }

    onPageAdded() {
        this.doc
            .fillColor(this.colors.lightBg)
            .rect(0, 0, this.leftColWidth + this.margins.left, this.pageHeight)
            .fill();
        
        this.doc
            .strokeColor(this.colors.border)
            .lineWidth(1)
            .moveTo(this.leftColWidth + this.margins.left, 0)
            .lineTo(this.leftColWidth + this.margins.left, this.pageHeight)
            .stroke();
    }

    generateSections(data) {
        this.onPageAdded();
        
        this.leftColY = this.margins.top;
        this.rightColY = this.margins.top;
        
        // Header
        this.doc
            .fillColor(this.colors.primary)
            .fontSize(28)
            .font(this.config.fonts.header)
            .text(data.personalInfo.name, this.rightColX, this.rightColY);
        
        this.doc
            .fillColor(this.colors.secondary)
            .fontSize(14)
            .font(this.config.fonts.body)
            .text(data.personalInfo.title, this.rightColX, this.rightColY + 30);
        
        this.rightColY += 60;
        
        // Profile
        const profileHeight = this.calculateTextHeight(data.summary, {
            width: this.rightColWidth,
            fontSize: 10,
            lineGap: 4
        });
        
        if (this.rightColY + profileHeight + 30 > this.pageHeight - this.margins.bottom) {
            const spaceLeft = this.pageHeight - this.margins.bottom - this.rightColY - 30;
            const firstPart = this.getPartialText(data.summary, spaceLeft, {
                width: this.rightColWidth,
                fontSize: 10,
                lineGap: 4
            });
            
            this.doc
                .fillColor(this.colors.text)
                .fontSize(10)
                .font(this.config.fonts.body)
                .text(firstPart.text, this.rightColX, this.rightColY, {
                    width: this.rightColWidth,
                    lineGap: 4
                });
            
            this.rightColY = this.pageHeight - this.margins.bottom + 20;
            this.addNewPage();
            
            this.doc
                .fillColor(this.colors.text)
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
            this.doc
                .fillColor(this.colors.text)
                .fontSize(10)
                .font(this.config.fonts.body)
                .text(data.summary, this.rightColX, this.rightColY, {
                    width: this.rightColWidth,
                    lineGap: 4
                });
            
            this.rightColY += profileHeight + 15;
        }
        
        // Left Column Sections
        this.leftColY = this.drawContact(data.contact, this.leftColX, this.leftColY);
        this.leftColY = this.drawEducation(data.education, this.leftColX, this.leftColY);
        this.leftColY = this.drawSkills(data.skills, this.leftColX, this.leftColY);
        this.leftColY = this.drawLanguages(data.languages, this.leftColX, this.leftColY);
        
        if (data.certificates && data.certificates.length) {
            this.leftColY = this.drawCertificates(data.certificates, this.leftColX, this.leftColY);
        }
        
        // Right Column Sections
        this.rightColY = this.drawExperience(data.experience, this.rightColX, this.rightColY);
        
        if (data.projects && data.projects.length) {
            this.rightColY = this.drawProjects(data.projects, this.rightColX, this.rightColY);
        }
        
        if (data.awards && data.awards.length) {
            this.rightColY = this.drawAwards(data.awards, this.rightColX, this.rightColY);
        }
        
        // this.rightColY = this.drawReferences(data.references, this.rightColX, this.rightColY);
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
        
        this.doc
            .fillColor(this.colors.primary)
            .fontSize(14)
            .font(this.config.fonts.header)
            .text('CONTACT', x, y);
        
        y += 20;
        
        const items = [
            { value: data.phone },
            { value: data.email },
            { value: data.address },
            { value: data.website }
        ];
        
        items.forEach(item => {
            if (y + 20 > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
            }
            
            const valueHeight = this.calculateTextHeight(item.value, {
                width: this.leftColWidth - 1,
                fontSize: 10,
                lineGap: 2
            });
            
            this.doc
                .fillColor(this.colors.text)
                .fontSize(10)
                .font(this.config.fonts.body)
                .text(item.value, x + 20, y + 3, {
                    width: this.leftColWidth - 1
                });
            
            y += Math.max(18, valueHeight + 2);
        });
        
        return y + 5;
    }

    drawEducation(education, x, startY) {
        let y = startY;
        
        this.doc
            .fillColor(this.colors.primary)
            .fontSize(14)
            .font(this.config.fonts.header)
            .text('EDUCATION', x, y);
        
        y += 20;
        
        education.forEach((edu) => {
            if (y + 70 > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
            }
            
            this.doc
                .fillColor(this.colors.secondary)
                .fontSize(10)
                .font(this.config.fonts.subheader)
                .text(edu.year, x, y);
            y += 12;
            
            this.doc
                .fillColor(this.colors.primary)
                .fontSize(11)
                .font(this.config.fonts.subheader)
                .text(edu.school, x, y);
            y += 12;
            
            this.doc
                .fillColor(this.colors.text)
                .fontSize(10)
                .font(this.config.fonts.body)
                .text(edu.degree, x, y);
            y += 12;
            
            if (edu.gpa) {
                this.doc
                    .fillColor(this.colors.text)
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
        
        this.doc
            .fillColor(this.colors.primary)
            .fontSize(14)
            .font(this.config.fonts.header)
            .text('SKILLS', x, y); 
        
        y += 20;  

        const colWidth = this.leftColWidth; 
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
                .fillColor(this.colors.text)
                .fontSize(9)
                .font(this.config.fonts.body)
                .text(`• ${skill}`, x, y, {
                    lineBreak: false,  
                    continued: false
                });

            x = x + totalItemWidth + 10;  

            if (y > this.pageHeight - this.margins.bottom - 20) {
                this.addNewPage();
                y = this.margins.top;
                x = startX;
            }
        });
        
        y += 20;
        return y;
    }

    drawLanguages(languages, x, startY) {
        let y = startY;
        
        this.doc
            .fillColor(this.colors.primary)
            .fontSize(14)
            .font(this.config.fonts.header)
            .text('LANGUAGES', x, y);
        
        y += 20;
        
        languages.forEach((lang) => {
            if (y + 15 > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
            }
            
            this.doc
                .fillColor(this.colors.text)
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
        
        this.doc
            .fillColor(this.colors.primary)
            .fontSize(14)
            .font(this.config.fonts.header)
            .text('CERTIFICATES', x, y);
        
        y += 20;
        
        certificates.forEach((cert) => {
            if (y + 15 > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
            }
            
            this.doc
                .fillColor(this.colors.text)
                .fontSize(9)
                .font(this.config.fonts.body)
                .text(`• ${cert}`, x + 5, y, {
                    width: this.leftColWidth - 1
                });
            
            y += 12;
        });
        
        return y + 5;
    }

    drawExperience(experience, x, startY) {
        let y = startY;
        
        this.doc
            .fillColor(this.colors.primary)
            .fontSize(16)
            .font(this.config.fonts.header)
            .text('WORK EXPERIENCE', x, y);
        
        y += 25;
        
        experience.forEach((exp) => {
            // Handle both data structures (startDate/endDate or date)
            const startDate = exp.startDate || '';
            const endDate = exp.endDate || '';
            const dateText = exp.date || `${startDate} - ${endDate}`.trim();
            const finalDateText = (dateText && dateText !== ' - ') ? dateText : 'Date not specified';
            
            // Handle role/position
            const roleText = exp.role || exp.position || 'Position not specified';
            
            // Handle description/responsibilities
            const description = exp.description || exp.responsibilities || [];
            
            let expHeight = 40;
            description.forEach(desc => {
                expHeight += this.calculateTextHeight(`• ${desc}`, {
                    width: this.rightColWidth - 20,
                    fontSize: 9
                }) + 4;
            });
            
            if (y + expHeight > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
            }
            
            // Company name
            const companyName = exp.company || 'Not Specified';
            this.doc
                .fillColor(this.colors.primary)
                .fontSize(13)
                .font(this.config.fonts.subheader)
                .text(companyName, x, y);
            
            // Date
            const dateWidth = this.doc.widthOfString(finalDateText);
            this.doc
                .fillColor(this.colors.secondary)
                .fontSize(11)
                .font(this.config.fonts.subheader)
                .text(finalDateText, x + this.rightColWidth - dateWidth, y);
            
            y += 18;
            
            // Role/Position
            this.doc
                .fillColor(this.colors.secondary)
                .fontSize(12)
                .font(this.config.fonts.italic)
                .text(roleText, x, y);
            
            y += 18;
            
            // Description bullets
            description.forEach(desc => {
                const descHeight = this.calculateTextHeight(`• ${desc}`, {
                    width: this.rightColWidth - 20,
                    fontSize: 9
                });
                
                this.doc
                    .fillColor(this.colors.text)
                    .fontSize(9)
                    .font(this.config.fonts.body)
                    .text(`• ${desc}`, x + 10, y, {
                        width: this.rightColWidth - 20,
                        lineGap: 2
                    });
                
                y += descHeight + 4;
            });
            
            y += 15;
        });
        
        return y;
    }

    drawProjects(projects, x, startY) {
        let y = startY;
        
        this.doc
            .fillColor(this.colors.primary)
            .fontSize(16)
            .font(this.config.fonts.header)
            .text('PROJECTS', x, y);
        
        y += 25;
        
        projects.forEach((project) => {
            let projHeight = 15;
            if (project.description) {
                projHeight += this.calculateTextHeight(project.description, {
                    width: this.rightColWidth,
                    fontSize: 9
                }) + 5;
            }
            if (project.technologies) {
                projHeight += 12;
            }
            
            if (y + projHeight > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
            }
            
            this.doc
                .fillColor(this.colors.primary)
                .fontSize(12)
                .font(this.config.fonts.subheader)
                .text(project.name, x, y);
            y += 15;
            
            if (project.description) {
                const descHeight = this.calculateTextHeight(project.description, {
                    width: this.rightColWidth,
                    fontSize: 9
                });
                
                this.doc
                    .fillColor(this.colors.text)
                    .fontSize(9)
                    .font(this.config.fonts.body)
                    .text(project.description, x, y, {
                        width: this.rightColWidth
                    });
                
                y += descHeight + 5;
            }
            
            if (project.technologies) {
                this.doc
                    .fillColor(this.colors.secondary)
                    .fontSize(8)
                    .font(this.config.fonts.italic)
                    .text(`Tech: ${project.technologies}`, x, y);
                y += 12;
            }
            
            y += 10;
        });
        
        return y;
    }

    drawAwards(awards, x, startY) {
        let y = startY;
        
        this.doc
            .fillColor(this.colors.primary)
            .fontSize(16)
            .font(this.config.fonts.header)
            .text('AWARDS', x, y);
        
        y += 25;
        
        awards.forEach((award) => {
            const awardHeight = this.calculateTextHeight(`• ${award}`, {
                width: this.rightColWidth - 20,
                fontSize: 10,
                lineGap: 2
            });
            
            if (y + awardHeight + 10 > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
            }
            
            this.doc
                .fillColor(this.colors.text)
                .fontSize(10)
                .font(this.config.fonts.body)
                .text(`• ${award}`, x + 10, y, {
                    width: this.rightColWidth - 20,
                    lineGap: 2
                });
            
            y += awardHeight + 8;
        });
        
        y += 10;
        return y;
    }

    // drawReferences(references, x, startY) {
    //     let y = startY;
        
    //     this.doc
    //         .fillColor(this.colors.primary)
    //         .fontSize(16)
    //         .font(this.config.fonts.header)
    //         .text('REFERENCES', x, y);
        
    //     y += 25;
        
    //     references.forEach((ref) => {
    //         const refHeight = 60;
            
    //         if (y + refHeight > this.pageHeight - this.margins.bottom) {
    //             this.addNewPage();
    //             y = this.margins.top;
    //         }
            
    //         this.doc
    //             .fillColor(this.colors.primary)
    //             .fontSize(12)
    //             .font(this.config.fonts.subheader)
    //             .text(ref.name, x, y);
    //         y += 15;
            
    //         this.doc
    //             .fillColor(this.colors.secondary)
    //             .fontSize(11)
    //             .font(this.config.fonts.body)
    //             .text(ref.title, x, y);
    //         y += 12;
            
    //         this.doc
    //             .fillColor(this.colors.text)
    //             .fontSize(10)
    //             .font(this.config.fonts.body)
    //             .text(`Phone: ${ref.phone}`, x + 10, y);
    //         y += 12;
            
    //         this.doc
    //             .fillColor(this.colors.text)
    //             .fontSize(10)
    //             .font(this.config.fonts.body)
    //             .text(`Email: ${ref.email}`, x + 10, y);
    //         y += 20;
    //     });
        
    //     return y;
    // }
}

// ==================== SINGLE COLUMN CLASSIC TEMPLATE ====================
class SingleColumnClassicTemplate extends BaseResumeTemplate {
    constructor(colors, config = {}) {
        super(colors, config);
        this.contentX = this.margins.left;
        this.contentWidth = this.pageWidth - this.margins.left - this.margins.right;
    }

    generateSections(data) {
        this.currentY = this.margins.top;
        
        this.doc
            .fillColor(this.colors.primary)
            .fontSize(32)
            .font(this.config.fonts.header)
            .text(data.personalInfo.name, this.contentX, this.currentY, { 
                align: 'center',
                width: this.contentWidth
            });
        
        this.currentY += 35;
        
        this.doc
            .fillColor(this.colors.secondary)
            .fontSize(16)
            .font(this.config.fonts.body)
            .text(data.personalInfo.title, this.contentX, this.currentY, { 
                align: 'center',
                width: this.contentWidth
            });
        
        this.currentY += 25;
        
        const contactText = `${data.contact.phone}  |  ${data.contact.email}  |  ${data.contact.address}  |  ${data.contact.website}`;
        
        this.doc
            .fillColor(this.colors.text)
            .fontSize(10)
            .font(this.config.fonts.body)
            .text(contactText, this.contentX, this.currentY, {
                align: 'center',
                width: this.contentWidth
            });
        
        this.currentY += 25;
        
        this.doc
            .strokeColor(this.colors.border)
            .lineWidth(1)
            .moveTo(this.contentX, this.currentY - 5)
            .lineTo(this.contentX + this.contentWidth, this.currentY - 5)
            .stroke();
        
        this.currentY = this.drawProfile(data.summary, this.currentY);
        this.currentY = this.drawExperience(data.experience, this.currentY);
        this.currentY = this.drawEducation(data.education, this.currentY);
        this.currentY = this.drawSkills(data.skills, this.currentY);
        this.currentY = this.drawLanguages(data.languages, this.currentY);
        
        if (data.certificates && data.certificates.length) {
            this.currentY = this.drawCertificates(data.certificates, this.currentY);
        }
        
        if (data.projects && data.projects.length) {
            this.currentY = this.drawProjects(data.projects, this.currentY);
        }
        
        // this.currentY = this.drawReferences(data.references, this.currentY);
    }

    drawProfile(text, startY) {
        let y = startY;
        
        this.doc
            .fillColor(this.colors.primary)
            .fontSize(16)
            .font(this.config.fonts.header)
            .text('PROFESSIONAL SUMMARY', this.contentX, y);
        
        y += 20;
        
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
                .fillColor(this.colors.text)
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
                .fillColor(this.colors.text)
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
                .fillColor(this.colors.text)
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
        
        this.doc
            .fillColor(this.colors.primary)
            .fontSize(16)
            .font(this.config.fonts.header)
            .text('WORK EXPERIENCE', this.contentX, y);
        
        y += 25;
        
        experiences.forEach((exp) => {
            let expHeight = 40;
            exp.description.forEach(resp => {
                expHeight += this.calculateTextHeight(`• ${resp}`, {
                    width: this.contentWidth - 20,
                    fontSize: 10
                }) + 4;
            });
            
            if (y + expHeight > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
            }
            
            this.doc
                .fillColor(this.colors.primary)
                .fontSize(14)
                .font(this.config.fonts.subheader)
                .text(exp.company, this.contentX, y);
            
            const dateWidth = this.doc.widthOfString(exp.date);
            this.doc
                .fillColor(this.colors.secondary)
                .fontSize(12)
                .font(this.config.fonts.subheader)
                .text(exp.date, this.contentX + this.contentWidth - dateWidth, y);
            
            y += 20;
            
            this.doc
                .fillColor(this.colors.secondary)
                .fontSize(12)
                .font(this.config.fonts.italic)
                .text(exp.position, this.contentX, y);
            
            y += 18;
            
            exp.description.forEach(resp => {
                const respHeight = this.calculateTextHeight(`• ${resp}`, {
                    width: this.contentWidth - 20,
                    fontSize: 10
                });
                
                this.doc
                    .fillColor(this.colors.text)
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
        
        this.doc
            .fillColor(this.colors.primary)
            .fontSize(16)
            .font(this.config.fonts.header)
            .text('EDUCATION', this.contentX, y);
        
        y += 25;
        
        education.forEach((edu) => {
            if (y + 80 > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
            }
            
            this.doc
                .fillColor(this.colors.primary)
                .fontSize(13)
                .font(this.config.fonts.subheader)
                .text(edu.school, this.contentX, y);
            
            const yearWidth = this.doc.widthOfString(edu.year);
            this.doc
                .fillColor(this.colors.secondary)
                .fontSize(11)
                .font(this.config.fonts.subheader)
                .text(edu.year, this.contentX + this.contentWidth - yearWidth, y);
            
            y += 18;
            
            this.doc
                .fillColor(this.colors.text)
                .fontSize(11)
                .font(this.config.fonts.body)
                .text(edu.degree, this.contentX + 10, y);
            y += 15;
            
            if (edu.gpa) {
                this.doc
                    .fillColor(this.colors.text)
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
        
        this.doc
            .fillColor(this.colors.primary)
            .fontSize(16)
            .font(this.config.fonts.header)
            .text('SKILLS', this.contentX, y);
        
        y += 25;
        
        const colWidth = (this.contentWidth - 40) / 3;
        
        skills.forEach((skill, index) => {
            const col = index % 3;
            const row = Math.floor(index / 3);
            const skillX = this.contentX + (col * (colWidth + 10));
            const skillY = y + (row * 18);
            
            if (row > 0 && row % 20 === 0 && skillY > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
                const newSkillY = y + ((index % 60) * 18);
                this.doc
                    .fillColor(this.colors.text)
                    .fontSize(10)
                    .font(this.config.fonts.body)
                    .text(`• ${skill}`, this.contentX + (col * (colWidth + 10)), newSkillY, {
                        width: colWidth
                    });
            } else {
                this.doc
                    .fillColor(this.colors.text)
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
        
        this.doc
            .fillColor(this.colors.primary)
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
                .fillColor(this.colors.text)
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
        
        this.doc
            .fillColor(this.colors.primary)
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
                .fillColor(this.colors.text)
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
        
        this.doc
            .fillColor(this.colors.primary)
            .fontSize(16)
            .font(this.config.fonts.header)
            .text('PROJECTS', this.contentX, y);
        
        y += 25;
        
        projects.forEach((project) => {
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
            
            if (y + projHeight > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
                y = this.margins.top;
            }
            
            this.doc
                .fillColor(this.colors.primary)
                .fontSize(13)
                .font(this.config.fonts.subheader)
                .text(project.name, this.contentX, y);
            y += 15;
            
            if (project.description) {
                const descHeight = this.calculateTextHeight(project.description, {
                    width: this.contentWidth,
                    fontSize: 10
                });
                
                this.doc
                    .fillColor(this.colors.text)
                    .fontSize(10)
                    .font(this.config.fonts.body)
                    .text(project.description, this.contentX, y, {
                        width: this.contentWidth
                    });
                
                y += descHeight + 5;
            }
            
            if (project.technologies) {
                this.doc
                    .fillColor(this.colors.secondary)
                    .fontSize(9)
                    .font(this.config.fonts.italic)
                    .text(`Technologies: ${project.technologies}`, this.contentX, y);
                y += 15;
            }
            
            y += 10;
        });
        
        return y;
    }

    // drawReferences(references, startY) {
    //     let y = startY;
        
    //     this.doc
    //         .fillColor(this.colors.primary)
    //         .fontSize(16)
    //         .font(this.config.fonts.header)
    //         .text('REFERENCES', this.contentX, y);
        
    //     y += 25;
        
    //     references.forEach((ref) => {
    //         const refHeight = 70;
            
    //         if (y + refHeight > this.pageHeight - this.margins.bottom) {
    //             this.addNewPage();
    //             y = this.margins.top;
    //         }
            
    //         this.doc
    //             .fillColor(this.colors.primary)
    //             .fontSize(13)
    //             .font(this.config.fonts.subheader)
    //             .text(ref.name, this.contentX, y);
    //         y += 15;
            
    //         this.doc
    //             .fillColor(this.colors.secondary)
    //             .fontSize(11)
    //             .font(this.config.fonts.body)
    //             .text(ref.title, this.contentX, y);
    //         y += 12;
            
    //         this.doc
    //             .fillColor(this.colors.text)
    //             .fontSize(10)
    //             .font(this.config.fonts.body)
    //             .text(`Phone: ${ref.phone}`, this.contentX + 15, y);
    //         y += 12;
            
    //         this.doc
    //             .fillColor(this.colors.text)
    //             .fontSize(10)
    //             .font(this.config.fonts.body)
    //             .text(`Email: ${ref.email}`, this.contentX + 15, y);
    //         y += 20;
            
    //         y += 5;
    //     });
        
    //     return y;
    // }

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
    static createTemplate(type, colors, config = {}) {
        switch(type) {
            case 'two-column-modern':
                return new TwoColumnModernTemplate(colors, config);
            case 'single-column-classic':
                return new SingleColumnClassicTemplate(colors, config);
            default:
                throw new Error(`Unknown template type: ${type}`);
        }
    }
}

// ==================== MAIN EXPORT ====================
export async function generateAndUploadResume(data, templateType = 'two-column-modern', colors, userId = null) {
    try {
        // Merge user colors with defaults
        const finalColors = { ...COLOR_SCHEMES.professional, ...colors };
        
        // Create template instance
        const template = ResumeTemplateFactory.createTemplate(templateType, finalColors);
        
        // Generate unique filename
        const timestamp = Date.now();
        const uniqueId = userId ? `${userId}_${timestamp}` : `${timestamp}_${Math.random().toString(36).substring(7)}`;
        const fileName = `resumes/${uniqueId}.pdf`;
        
        // Generate and upload to S3
        const result = await template.generateAndUpload(data, fileName);
        
        return {
            success: true,
            url: result.url,
            fileName: result.fileName,
            pages: result.pages
        };
    } catch (error) {
        console.error('Error generating resume:', error);
        throw error;
    }
}

export const TEMPLATE_TYPES = {
    MODERN: 'two-column-modern',
    CLASSIC: 'single-column-classic'
};