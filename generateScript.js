import PDFDocument from 'pdfkit';
import fs from 'fs';

// Create a PDF document
const doc = new PDFDocument({
  size: 'A4',
  margins: {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
  }
});

// Pipe the PDF output to a file
doc.pipe(fs.createWriteStream('resume.pdf'));

// Helper function to draw a section header
function drawSectionHeader(title, y) {
  doc.font('Helvetica-Bold')
     .fontSize(14)
     .fillColor('#2c3e50')
     .text(title.toUpperCase(), 50, y);
  
  // Draw underline
  doc.moveTo(50, y + 5)
     .lineTo(550, y + 5)
     .lineWidth(1)
     .strokeColor('#3498db')
     .stroke();
  
  return y + 25;
}

// Helper function to draw job entry
function drawJobEntry(date, title, company, location, bullets, startY) {
  let y = startY;
  
  // Date (right-aligned)
  doc.font('Helvetica-Oblique')
     .fontSize(10)
     .fillColor('#7f8c8d')
     .text(date, 400, y, { align: 'right' });
  
  // Job title and company
  doc.font('Helvetica-Bold')
     .fontSize(12)
     .fillColor('#2c3e50')
     .text(title, 50, y);
  
  doc.font('Helvetica')
     .fontSize(11)
     .fillColor('#34495e')
     .text(company + ' | ' + location, 50, y + 15);
  
  y += 35;
  
  // Bullet points
  bullets.forEach(bullet => {
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#2c3e50')
       .text('• ' + bullet, 70, y, {
         width: 480,
         align: 'left',
         lineGap: 5
       });
    
    // Calculate the height of the bullet text to position next bullet
    const bulletHeight = doc.heightOfString('• ' + bullet, {
      width: 480
    });
    y += bulletHeight + 5;
  });
  
  return y + 10;
}

// Helper function to draw education entry
function drawEducationEntry(date, degree, school, details, startY) {
  let y = startY;
  
  // Date (right-aligned)
  doc.font('Helvetica-Oblique')
     .fontSize(10)
     .fillColor('#7f8c8d')
     .text(date, 400, y, { align: 'right' });
  
  // Degree
  doc.font('Helvetica-Bold')
     .fontSize(12)
     .fillColor('#2c3e50')
     .text(degree, 50, y);
  
  // School
  doc.font('Helvetica')
     .fontSize(11)
     .fillColor('#34495e')
     .text(school, 50, y + 15);
  
  y += 35;
  
  // Details
  details.forEach(detail => {
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#2c3e50')
       .text('• ' + detail, 70, y, {
         width: 480,
         lineGap: 5
       });
    
    const detailHeight = doc.heightOfString('• ' + detail, {
      width: 480
    });
    y += detailHeight + 5;
  });
  
  return y + 10;
}

// Start building the resume

// Name at the top
doc.font('Helvetica-Bold')
   .fontSize(28)
   .fillColor('#1a2634')
   .text('CHARLES MENDOZA', 50, 50, {
     align: 'center'
   });

let currentY = 100;

// WORK HISTORY Section
currentY = drawSectionHeader('WORK HISTORY', currentY);

// First job entry
currentY = drawJobEntry(
  'June 2007 - Current',
  'Lead Engineer/Architect',
  'YAHOO! Inc',
  'Sunnyvale, CA',
  [
    'Single Point of Contact (SPOC) to Microsoft for AdCenter integration which was one of crucial projects having direct revenue impacts.',
    'Created a strong working relationship with Microsoft management in this role.',
    'Managed integration team for successful delivery.',
    'Came up with overall integration architecture for Microsoft integration based on SOA (Service Oriented Architecture) and design patterns.',
    'Exposed Web Service APIs to Microsoft which has volumes of up to a million per month.'
  ],
  currentY
);

// Second job entry
currentY = drawJobEntry(
  'July 2011 - Current',
  'Engineering Manager/Integration Architect',
  'MICROSOFT Inc',
  'Austin, TX',
  [
    'Came up with the overall integration architecture for all SFDC cloud integrations.',
    'Hired and managed a team of 10+ employees and contractors.',
    'Provided guidance to new Scrum team members for working in Agile/Scrum projects.',
    'Conduct design and code reviews.'
  ],
  currentY
);

// EDUCATION Section
currentY += 10;
currentY = drawSectionHeader('EDUCATION', currentY);

// First education entry
currentY = drawEducationEntry(
  'July 2013',
  'Bachelor of Engineering | Computer Science',
  'US University',
  [
    'Passed with distinction.',
    'GPA: 4.0'
  ],
  currentY
);

// Second education entry
currentY = drawEducationEntry(
  'August 2015',
  'Master of Science (MS) | Software Management',
  'Carnegie Mellon University CMU',
  [
    'Graduation with honors cum laude',
    'GPA: 9.0'
  ],
  currentY
);

// ACCOMPLISHMENTS Section
currentY += 10;
currentY = drawSectionHeader('ACCOMPLISHMENTS', currentY);

// Accomplishments content
doc.font('Helvetica')
   .fontSize(10)
   .fillColor('#2c3e50')
   .text('Certifications, Trainings Undertaken:', 50, currentY);

currentY += 20;

const trainings = [
  'SOA & Middleware: 3 days Oracle BPEL/Fusion Training in Oracle office',
  '2 days TIBCO ESB Workshop from TIBCO @Yahoo Inc., Santa Clara, CA',
  '3 days Oracle SOA Workshop in 2011 from Oracle @Yahoo Inc., Santa Clara, CA'
];

trainings.forEach((training, index) => {
  doc.text(`${index + 1}. ${training}`, 70, currentY, {
    width: 480,
    lineGap: 5
  });
  
  const textHeight = doc.heightOfString(`${index + 1}. ${training}`, {
    width: 480
  });
  currentY += textHeight + 5;
});

// Add a subtle border/frame around the resume
doc.rect(30, 30, 555, 800)
   .lineWidth(1)
   .strokeColor('#ecf0f1')
   .stroke();

// Finalize the PDF
doc.end();

console.log('Resume PDF generated successfully!');