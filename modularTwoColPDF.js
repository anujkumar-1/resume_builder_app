import PDFDocument from 'pdfkit';
import fs from 'fs';

// Configuration object for easy customization
const RESUME_CONFIG = {
    colors: {
        primary: '#2C3E50',      // Dark blue for headers
        secondary: '#E67E22',     // Orange accent
        text: '#333333',          // Dark gray for body text
        lightBg: '#F8F9',       // Light background for left column
        border: '#E0E0E0',        // Light gray for borders
        white: '#FFFFFF'
    },
    dimensions: {
        leftColWidth: 200,
        rightColWidth: null, // Will be calculated
        margin: 20,
        pageSize: 'A4'
    },
    fonts: {
        header: 'Helvetica-Bold',
        subheader: 'Helvetica-Bold',
        body: 'Helvetica',
        italic: 'Helvetica-Oblique'
    },
    spacing: {
        sectionGap: 25,
        itemGap: 15,
        bulletGap: 5
    }
};

class ResumeGenerator {
    constructor(config = {}) {
        this.config = this.mergeConfig(RESUME_CONFIG, config);
        this.doc = new PDFDocument({
            size: this.config.dimensions.pageSize,
            margin: 0,
            layout: 'portrait'
        });
        
        // Calculate right column width
        this.config.dimensions.rightColWidth = this.doc.page.width - this.config.dimensions.leftColWidth - 40;
        
        // Current Y position tracker
        this.currentY = {
            left: 40,
            right: 0
        };
    }

    // Utility function to merge user config with defaults
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

    // ==================== LAYOUT FUNCTIONS ====================

    drawLeftColumn() {
        this.doc
            .fillColor(this.config.colors.lightBg)
            .rect(0, 0, this.config.dimensions.leftColWidth, this.doc.page.height)
            .fill();
        
        this.doc
            .strokeColor(this.config.colors.border)
            .lineWidth(1)
            .moveTo(this.config.dimensions.leftColWidth, 0)
            .lineTo(this.config.dimensions.leftColWidth, this.doc.page.height)
            .stroke();
    }

    // ==================== HEADER FUNCTIONS ====================

    drawHeader(name, title) {
        const x = this.config.dimensions.leftColWidth + 30;
        
        // Name
        this.doc
            .fillColor(this.config.colors.primary)
            .fontSize(28)
            .font(this.config.fonts.header)
            .text(name, x, 40);
        
        // Title
        this.doc
            .fillColor(this.config.colors.secondary)
            .fontSize(14)
            .font(this.config.fonts.body)
            .text(title, x, 80);
        
        this.currentY.right = 120;
    }

    // ==================== LEFT COLUMN SECTIONS ====================

    drawContact(contactInfo) {
        const x = 20;
        let y = this.currentY.left;
        
        // Section title
        this.drawSectionTitle('CONTACT', x, y);
        y += 25;
        
        // Contact items
        const items = [
            { label: 'Phone:', value: contactInfo.phone },
            { label: 'Email:', value: contactInfo.email },
            { label: 'Address:', value: contactInfo.address },
            { label: 'Website:', value: contactInfo.website }
        ];
        
        items.forEach(item => {
            // Draw label
            this.doc
                .fillColor(this.config.colors.secondary)
                .fontSize(10)
                .font(this.config.fonts.subheader)
                .text(item.label, x, y);
            
            // Calculate label width
            const labelWidth = this.doc.widthOfString(item.label);
            
            // Draw value
            this.doc
                .fillColor(this.config.colors.text)
                .fontSize(9)
                .font(this.config.fonts.body)
                .text(item.value, x + labelWidth + 5, y, {
                    width: this.config.dimensions.leftColWidth - x - labelWidth - 15,
                    align: 'left',
                    continued: false
                });
            
            // Calculate height for next line
            const valueHeight = this.doc.heightOfString(item.value, {
                width: this.config.dimensions.leftColWidth - x - labelWidth - 15
            });
            
            y += Math.max(18, valueHeight + 5);
        });
        
        this.currentY.left = y + 10;
    }

    // Alternative: Two-column layout for contact
    drawContactGrid(contactInfo) {
        const x = 20;
        let y = this.currentY.left;
        
        this.drawSectionTitle('CONTACT', x, y);
        y += 25;
        
        const contacts = [
            { label: 'Phone', value: contactInfo.phone },
            { label: 'Email', value: contactInfo.email },
            { label: 'Address', value: contactInfo.address },
            { label: 'Website', value: contactInfo.website }
        ];
        
        contacts.forEach(contact => {
            // Label with colon
            this.doc
                .fillColor(this.config.colors.secondary)
                .fontSize(9)
                .font(this.config.fonts.subheader)
                .text(`${contact.label}:`, x, y);
            
            // Value
            const valueY = y;
            this.doc
                .fillColor(this.config.colors.text)
                .fontSize(9)
                .font(this.config.fonts.body)
                .text(contact.value, x + 50, valueY, {
                    width: this.config.dimensions.leftColWidth - x - 60,
                    align: 'left'
                });
            
            // Calculate height
            const valueHeight = this.doc.heightOfString(contact.value, {
                width: this.config.dimensions.leftColWidth - x - 60
            });
            
            y += Math.max(18, valueHeight + 5);
        });
        
        this.currentY.left = y + 10;
    }

    drawEducation(education) {
        const x = 20;
        let y = this.currentY.left;
        
        this.drawSectionTitle('EDUCATION', x, y);
        y += 25;
        
        education.forEach(edu => {
            // Year
            this.doc
                .fillColor(this.config.colors.secondary)
                .fontSize(10)
                .font(this.config.fonts.subheader)
                .text(edu.year, x, y);
            y += 15;
            
            // School
            this.doc
                .fillColor(this.config.colors.primary)
                .fontSize(11)
                .font(this.config.fonts.subheader)
                .text(edu.school, x, y);
            y += 15;
            
            // Degree
            this.doc
                .fillColor(this.config.colors.text)
                .fontSize(10)
                .font(this.config.fonts.body)
                .text(edu.degree, x, y);
            y += 15;
            
            // GPA if exists
            if (edu.gpa) {
                this.doc
                    .fillColor(this.config.colors.text)
                    .fontSize(9)
                    .font(this.config.fonts.italic)
                    .text(edu.gpa, x, y);
                y += 25;
            } else {
                y += 10;
            }
        });
        
        this.currentY.left = y;
    }

    drawSkills(skills) {
        const x = 20;
        let y = this.currentY.left;
        
        this.drawSectionTitle('SKILLS', x, y);
        y += 25;
        
        this.doc
            .fillColor(this.config.colors.text)
            .fontSize(10)
            .font(this.config.fonts.body);
        
        skills.forEach(skill => {
            this.doc.text(`• ${skill}`, x + 5, y, {
                width: this.config.dimensions.leftColWidth - 30,
                align: 'left'
            });
            y += 15;
        });
        
        this.currentY.left = y;
    }

    drawLanguages(languages) {
        const x = 20;
        let y = this.currentY.left;
        
        this.drawSectionTitle('LANGUAGES', x, y);
        y += 25;
        
        this.doc
            .fillColor(this.config.colors.text)
            .fontSize(10)
            .font(this.config.fonts.body);
        
        languages.forEach(lang => {
            this.doc.text(`• ${lang}`, x + 5, y, {
                width: this.config.dimensions.leftColWidth - 30,
                align: 'left'
            });
            y += 18;
        });
        
        this.currentY.left = y;
    }

    // ==================== RIGHT COLUMN SECTIONS ====================

    drawProfile(profile) {
        const x = this.config.dimensions.leftColWidth + 30;
        let y = this.currentY.right;
        
        this.drawSectionTitle('PROFILE', x, y);
        y += 20;
        
        this.doc
            .fillColor(this.config.colors.text)
            .fontSize(10)
            .font(this.config.fonts.body)
            .text(profile, x, y, {
                width: this.config.dimensions.rightColWidth,
                align: 'left',
                lineGap: 4
            });
        
        // Calculate text height and update Y
        const textHeight = this.doc.heightOfString(profile, {
            width: this.config.dimensions.rightColWidth,
            align: 'left',
            lineGap: 4
        });
        
        this.currentY.right = y + textHeight + 20;
    }

    drawWorkExperience(experiences) {
        const x = this.config.dimensions.leftColWidth + 30;
        let y = this.currentY.right;
        
        this.drawSectionTitle('WORK EXPERIENCE', x, y);
        y += 25;
        
        experiences.forEach(exp => {
            // Company and date on same line
            this.doc
                .fillColor(this.config.colors.primary)
                .fontSize(12)
                .font(this.config.fonts.subheader)
                .text(exp.company, x, y);
            
            const dateWidth = this.doc.widthOfString(exp.date);
            this.doc
                .fillColor(this.config.colors.secondary)
                .fontSize(10)
                .font(this.config.fonts.subheader)
                .text(exp.date, x + this.config.dimensions.rightColWidth - dateWidth, y);
            
            y += 18;
            
            // Position
            this.doc
                .fillColor(this.config.colors.secondary)
                .fontSize(11)
                .font(this.config.fonts.subheader)
                .text(exp.position, x, y);
            
            y += 18;
            
            // Responsibilities
            exp.responsibilities.forEach(resp => {
                const respHeight = this.doc.heightOfString(`• ${resp}`, {
                    width: this.config.dimensions.rightColWidth - 15,
                    align: 'left',
                    lineGap: 2
                });
                
                this.doc
                    .fillColor(this.config.colors.text)
                    .fontSize(9)
                    .font(this.config.fonts.body)
                    .text(`• ${resp}`, x + 5, y, {
                        width: this.config.dimensions.rightColWidth - 15,
                        align: 'left',
                        lineGap: 2
                    });
                
                y += respHeight + 5;
            });
            
            y += 15;
        });
        
        this.currentY.right = y;
    }

    drawReferences(references) {
        const x = this.config.dimensions.leftColWidth + 30;
        let y = this.currentY.right;
        
        // Check if we need a new page
        if (y > this.doc.page.height - 150) {
            this.doc.addPage();
            this.drawLeftColumn();
            this.currentY.right = 40;
            y = 40;
        }
        
        this.drawSectionTitle('REFERENCE', x, y);
        y += 25;
        
        references.forEach(ref => {
            // Name
            this.doc
                .fillColor(this.config.colors.primary)
                .fontSize(11)
                .font(this.config.fonts.subheader)
                .text(ref.name, x, y);
            y += 15;
            
            // Title
            this.doc
                .fillColor(this.config.colors.secondary)
                .fontSize(10)
                .font(this.config.fonts.subheader)
                .text(ref.title, x, y);
            y += 15;
            
            // Phone
            this.doc
                .fillColor(this.config.colors.text)
                .fontSize(9)
                .font(this.config.fonts.body)
                .text(`Phone: ${ref.phone}`, x, y);
            y += 12;
            
            // Email
            this.doc
                .fillColor(this.config.colors.text)
                .fontSize(9)
                .font(this.config.fonts.body)
                .text(`Email: ${ref.email}`, x, y);
            y += 25;
        });
        
        this.currentY.right = y;
    }

    // Helper function to draw section titles
    drawSectionTitle(title, x, y) {
        this.doc
            .fillColor(this.config.colors.primary)
            .fontSize(14)
            .font(this.config.fonts.subheader)
            .text(title, x, y);
    }

    // ==================== GENERATE RESUME ====================

    generateResume(data, filename) {
        this.doc.pipe(fs.createWriteStream(filename));
        
        // Draw left column background
        this.drawLeftColumn();
        
        // Draw header
        this.drawHeader(data.personalInfo.name, data.personalInfo.title);
        
        // Left column sections
        this.drawContact(data.contact);
        this.drawEducation(data.education);
        this.drawSkills(data.skills);
        this.drawLanguages(data.languages);
        
        // Right column sections
        this.drawProfile(data.profile);
        this.drawWorkExperience(data.experience);
        this.drawReferences(data.references);
        
        this.doc.end();
        console.log(`✅ Resume generated: ${filename}`);
    }
}

// ==================== DATA MODELS ====================

// Sample resume data
const resumeData = {
    personalInfo: {
        name: 'RICHARD SANCHEZ',
        title: 'MARKETING MANAGER'
    },
    contact: {
        phone: '+123-456-7890',
        email: 'hello@reallygreatsite.com',
        address: '123 Anywhere St., Any City',
        website: 'www.reallygreatsite.com'
    },
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
        'Project Management',
        'Public Relations',
        'Teamwork',
        'Time Management',
        'Leadership',
        'Effective Communication',
        'Critical Thinking'
    ],
    languages: [
        'English (Fluent)',
        'French (Fluent)',
        'German (Basics)',
        'Spanish (Intermediate)'
    ],
    profile: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation. Ut enim ad minim veniam quis nostrud exercitation.',
    experience: [
        {
            company: 'Borcelle Studio',
            position: 'Marketing Manager & Specialist',
            date: '2030 - PRESENT',
            responsibilities: [
                'Develop and execute comprehensive marketing strategies and campaigns that align with the company\'s goals and objectives.',
                'Lead, mentor, and manage a high-performing marketing team, fostering a collaborative and results-driven work environment.',
                'Monitor brand consistency across marketing channels and materials.'
            ]
        },
        {
            company: 'Fauget Studio',
            position: 'Marketing Manager & Specialist',
            date: '2025 - 2029',
            responsibilities: [
                'Create and manage the marketing budget, ensuring efficient allocation of resources and optimizing ROI.',
                'Oversee market research to identify emerging trends, customer needs, and competitor strategies.',
                'Monitor brand consistency across marketing channels and materials.'
            ]
        },
        {
            company: 'Studio Shodwe',
            position: 'Marketing Manager & Specialist',
            date: '2024 - 2025',
            responsibilities: [
                'Develop and maintain strong relationships with partners, agencies, and vendors to support marketing initiatives.',
                'Monitor and maintain brand consistency across all marketing channels and materials.'
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
        }
    ]
};

// ==================== USAGE EXAMPLES ====================

// Example 1: Generate resume with default styling
const resume = new ResumeGenerator();
resume.generateResume(resumeData, 'richard_sanchez_resume.pdf');

// Example 2: Generate resume with custom configuration
const customConfig = {
    colors: {
        primary: '#1E3A5F',  // Darker blue
        secondary: '#B76E3C', // Bronze accent
        text: '#2D2D2D'
    },
    fonts: {
        header: 'Helvetica-Bold',
        subheader: 'Helvetica-Bold',
        body: 'Helvetica'
    }
};

const customResume = new ResumeGenerator(customConfig);
customResume.generateResume(resumeData, 'custom_resume.pdf');

// Example 3: Generate resume with different contact layout
class AlternativeResumeGenerator extends ResumeGenerator {
    constructor(config) {
        super(config);
    }
    
    // Override contact method to use grid layout
    drawContact(contactInfo) {
        const x = 20;
        let y = this.currentY.left;
        
        this.drawSectionTitle('CONTACT', x, y);
        y += 25;
        
        const items = [
            { label: 'Phone', value: contactInfo.phone },
            { label: 'Email', value: contactInfo.email },
            { label: 'Address', value: contactInfo.address },
            { label: 'Website', value: contactInfo.website }
        ];
        
        items.forEach(item => {
            // Label
            this.doc
                .fillColor(this.config.colors.secondary)
                .fontSize(9)
                .font(this.config.fonts.subheader)
                .text(`${item.label}:`, x, y);
            
            // Value with indentation
            this.doc
                .fillColor(this.config.colors.text)
                .fontSize(9)
                .font(this.config.fonts.body)
                .text(item.value, x + 45, y, {
                    width: this.config.dimensions.leftColWidth - x - 55,
                    align: 'left'
                });
            
            const valueHeight = this.doc.heightOfString(item.value, {
                width: this.config.dimensions.leftColWidth - x - 55
            });
            
            y += Math.max(18, valueHeight + 5);
        });
        
        this.currentY.left = y + 10;
    }
}

// Generate with alternative contact layout
const altResume = new AlternativeResumeGenerator();
altResume.generateResume(resumeData, 'alternative_resume.pdf');

// Example 4: Create multiple resumes with different data
const userData = {
    ...resumeData,
    personalInfo: {
        name: 'JOHN SMITH',
        title: 'SALES DIRECTOR'
    },
    contact: {
        phone: '+987-654-3210',
        email: 'john.smith@company.com',
        address: '456 Business Ave, New York, NY 10001',
        website: 'www.johnsmith.com'
    }
};

const userResume = new ResumeGenerator();
userResume.generateResume(userData, 'john_smith_resume.pdf');