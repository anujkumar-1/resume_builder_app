import { Upload } from '@aws-sdk/lib-storage';
import PDFDocument from 'pdfkit';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { PassThrough } from 'stream';
import dotenv from 'dotenv';
dotenv.config();


// // Constants
//   const PAGE_HEIGHT = doc.page.height - 100; // Leave bottom margin
//   const primaryColor = '#030303';
//   const secondaryColor = '#080707';
//   const textColor = '#050404';


// Configure AWS SDK
const s3Client = new S3Client({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY,
    },
});

export async function generateAndUploadResume(userData, resumeData, fileName) {
  // Create a new PDF document
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  // Create a pass-through stream
  const passThrough = new PassThrough();
  
  generateResumePDF(userData, resumeData, doc);

   // Pipe the PDF to our pass-through stream
  doc.pipe(passThrough);
  // [All your existing PDF content generation code goes here]
  // Use the same resume generation code from previous examples
  // Finalize the PDF
  doc.end();

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
        return result.Location; // Return the S3 URL
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}



function generateResumePDF(userData, resumeData, doc) {
  // Constants
  const PAGE_HEIGHT = doc.page.height - 100; // Leave bottom margin
  const primaryColor = '#030303';
  const secondaryColor = '#080707';
  const textColor = '#050404';

  // Helper to check/add new page
  const checkPageBreak = (requiredSpace) => {
    if (doc.y + requiredSpace > PAGE_HEIGHT) {
      doc.addPage();
      return 50; // Reset Y position
    }
    return doc.y;
  };

  // Clean data helpers
  const cleanText = (text) =>{
      if(!text) return '';
   
   return text
      // Remove HTML tags and entities
      .replace(/<[^>]*>?/gm, '')
      .replace(/&[a-z0-9]+;/gi, ' ')
      
      // Remove all non-ASCII characters except basic punctuation
      .replace(/[^\x00-\x7F]/g, ' ')
      
      // Remove special symbols
      .replace(/[°•·–—˜ˆ¨´¸˝˛˚˘¦¤§¶†‡©®™¢£¥€+×÷=~<>^|¬¦ªº«»„“”‘’‚‛‹›¡¿‽⁇‼…]+/g, ' ')
      
      // Remove remaining special chars (keep only letters, numbers, and basic punctuation)
      .replace(/[^a-zA-Z0-9\s.,!?;:'"()-]/g, ' ')
      
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
   }; 


  const cleanDate = (date) => cleanText(date).replace(/\b\w/g, l => l.toUpperCase());
  const cleanList = (text) => (text || '').split('\n').map(cleanText).filter(item => item);

  // Header
  doc.font('Helvetica-Bold')
     .fontSize(18)
     .fillColor(primaryColor)
     .text(cleanText(userData.username), 50, 50);

   
     doc.moveTo(50, 75)
     .lineTo(550, 75)
     .lineWidth(1.4)
     .strokeColor("#5e6063")
     .stroke();
  
  let yPosition = 80;

  // Contact Info
  const contactInfo = [userData.email, userData.mobile].filter(Boolean).join(' | ');
  doc.font('Helvetica')
     .fontSize(10)
     .fillColor(secondaryColor)
     .text(contactInfo, 50, yPosition);
  
  yPosition = checkPageBreak(40);
  
  yPosition += 40;

  // Summary
  if (resumeData.summary) {
    yPosition = checkPageBreak(40);
    yPosition += 20;

    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text('SUMMARY', 50, yPosition);
    yPosition += 20;
    doc.font('Helvetica')
       .fontSize(10)
       .text(cleanText(resumeData.summary), 50, yPosition, { width: 500 });
    yPosition += doc.heightOfString(resumeData.summary, { width: 500 }) + 20;
  }


  // Experience
  if (resumeData.experiences?.length) {
    yPosition = checkPageBreak(40);
    yPosition += 20;

    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text('EXPERIENCE', 50, yPosition);

    resumeData.experiences.forEach(exp => {
      yPosition = checkPageBreak(60);
      yPosition += 15;

      // Role & Company
      doc.font('Helvetica-Bold')
         .fontSize(10)
         .text(`${cleanText(exp.role)} | ${cleanText(exp.company)}`, 50, yPosition);
      
      // Dates (right-aligned)

      const dateText = `${cleanDate(exp.startDate)} - ${cleanDate(exp.endDate)}`;
      yPosition += 20;

      doc.font('Helvetica')
         .fontSize(9)
         .fillColor(secondaryColor)
         .text(dateText, { width: 500, align: 'right' });
      
      yPosition += 30;

      // Description
      if (exp.description) {
        const cleanDesc = exp.description
          .split('\n')
          .map(cleanText)
          .join('\n');
        
        if (cleanDesc) {
          yPosition = checkPageBreak(doc.heightOfString(cleanDesc, { width: 490 }) + 10);
          doc.font('Helvetica')
             .fontSize(10)
             .text(cleanDesc, 50, yPosition, { width: 490 });
          yPosition += doc.heightOfString(cleanDesc, { width: 490 }) + 20;
        }
      }
    });
  }

    // Skills
  if (resumeData.skills) {
    yPosition = checkPageBreak(40);
    yPosition += 20;

    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text('SKILLS', 50, yPosition);
    yPosition += 20;
    
    const skills = resumeData.skills.split(',').map(s => `• ${cleanText(s)}`);
    doc.font('Helvetica')
       .fontSize(10)
       .text(skills.join('\n'), 50, yPosition);
    yPosition += skills.length * 15 + 20;
  }


  // Education
  if (resumeData.education?.length) {
    yPosition = checkPageBreak(40);
    yPosition += 20;

    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text('EDUCATION', 50, yPosition);
    yPosition += 20;

    resumeData.education.forEach(edu => {

      yPosition = checkPageBreak(40);
      yPosition += 15;

      doc.font('Helvetica-Bold')
         .fontSize(10)
         .text(`${cleanText(edu.degree)} | ${cleanText(edu.institution)}`, 50, yPosition);
      yPosition += 15;
      doc.font('Helvetica')
         .fontSize(9)
         .fillColor(secondaryColor)
         .text(cleanText(edu.year), 50, yPosition);
      yPosition += 25;
    });
  }

  // Certifications
  if (resumeData.certificates?.name) {
    yPosition = checkPageBreak(40);
    yPosition += 20;

    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text('CERTIFICATIONS', 50, yPosition);
    yPosition += 20;

    const certs = cleanList(resumeData.certificates.name);
    certs.forEach(cert => {
      doc.font('Helvetica')
         .fontSize(10)
         .text(`• ${cert}`, 50, yPosition);
      yPosition += 15;
    });
    yPosition += 10;
  }

  // Awards
  if (resumeData.awards?.title) {
    yPosition = checkPageBreak(40);
    yPosition += 20;

    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text('AWARDS', 50, yPosition);
    yPosition += 20;

    const awards = cleanList(resumeData.awards.title);
    awards.forEach(award => {
      doc.font('Helvetica')
         .fontSize(10)
         .text(`• ${award}`, 50, yPosition);
      yPosition += 15;
    });
    yPosition += 10;
  }

  // Languages
  if (resumeData.languages?.name) {
    yPosition = checkPageBreak(40);
    yPosition += 20;

    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text('LANGUAGES', 50, yPosition);
    yPosition += 20;

    const languages = cleanList(resumeData.languages.name);
    languages.forEach(lang => {
      doc.font('Helvetica')
         .fontSize(10)
         .text(`• ${lang}`, 50, yPosition);
      yPosition += 15;
    });
  }
}


// // Helper to check/add new page
//   const checkPageBreak = (requiredSpace) => {
//     if (doc.y + requiredSpace > PAGE_HEIGHT) {
//       doc.addPage();
//       return 50; // Reset Y position
//     }
//     return doc.y;
//   };

//   // Clean data helpers
//   const cleanText = (text) =>{
//       if(!text) return '';
   
//    return text
//       // Remove HTML tags and entities
//       .replace(/<[^>]*>?/gm, '')
//       .replace(/&[a-z0-9]+;/gi, ' ')
      
//       // Remove all non-ASCII characters except basic punctuation
//       .replace(/[^\x00-\x7F]/g, ' ')
      
//       // Remove special symbols
//       .replace(/[°•·–—˜ˆ¨´¸˝˛˚˘¦¤§¶†‡©®™¢£¥€+×÷=~<>^|¬¦ªº«»„“”‘’‚‛‹›¡¿‽⁇‼…]+/g, ' ')
      
//       // Remove remaining special chars (keep only letters, numbers, and basic punctuation)
//       .replace(/[^a-zA-Z0-9\s.,!?;:'"()-]/g, ' ')
      
//       // Normalize whitespace
//       .replace(/\s+/g, ' ')
//       .trim();
//    }; 


//   const cleanDate = (date) => cleanText(date).replace(/\b\w/g, l => l.toUpperCase());
//   const cleanList = (text) => (text || '').split('\n').map(cleanText).filter(item => item);


// function generateSummaryPDF(resumeData, yPosition, doc){
//    if (resumeData.summary!=null) {
//     yPosition = checkPageBreak(40);
//     yPosition += 20;

//     doc.font('Helvetica-Bold')
//        .fontSize(12)
//        .text('SUMMARY', 50, yPosition);
//     yPosition += 20;
//     doc.font('Helvetica')
//        .fontSize(10)
//        .text(cleanText(resumeData.summary), 50, yPosition, { width: 500 });
//     yPosition += doc.heightOfString(resumeData.summary, { width: 500 }) + 20;
//   }
// }


// function generateSkillPDF(resumeData, doc, yPosition){
   
//   // Skills
//   if (resumeData.skills) {
//     yPosition = checkPageBreak(40);
//     yPosition += 20;

//     doc.font('Helvetica-Bold')
//        .fontSize(12)
//        .text('SKILLS', 50, yPosition);
//     yPosition += 20;
    
//     const skills = resumeData.skills.split(',').map(s => `• ${cleanText(s)}`);
//     doc.font('Helvetica')
//        .fontSize(10)
//        .text(skills.join('\n'), 50, yPosition);
//     yPosition += skills.length * 15 + 20;
//   }
// }


// function generateExperiencePDF(resumeData, doc, yPosition){
//    if (resumeData.experiences?.length) {
//     yPosition = checkPageBreak(40);
//     yPosition += 20;

//     doc.font('Helvetica-Bold')
//        .fontSize(12)
//        .text('EXPERIENCE', 50, yPosition);

//     resumeData.experiences.forEach(exp => {
//       yPosition = checkPageBreak(60);
//       yPosition += 15;

//       // Role & Company
//       doc.font('Helvetica-Bold')
//          .fontSize(10)
//          .text(`${cleanText(exp.role)} | ${cleanText(exp.company)}`, 50, yPosition);
      
//       // Dates (right-aligned)

//       const dateText = `${cleanDate(exp.startDate)} - ${cleanDate(exp.endDate)}`;
//       yPosition += 20;

//       doc.font('Helvetica')
//          .fontSize(9)
//          .fillColor(secondaryColor)
//          .text(dateText, { width: 500, align: 'right' });
      
//       yPosition += 30;

//       // Description
//       if (exp.description) {
//         const cleanDesc = exp.description
//           .split('\n')
//           .map(cleanText)
//           .join('\n');
        
//         if (cleanDesc) {
//           yPosition = checkPageBreak(doc.heightOfString(cleanDesc, { width: 490 }) + 10);
//           doc.font('Helvetica')
//              .fontSize(10)
//              .text(cleanDesc, 50, yPosition, { width: 490 });
//           yPosition += doc.heightOfString(cleanDesc, { width: 490 }) + 20;
//         }
//       }
//     });
//   }
// }



// function generateEducationPDF(resumeData, doc, yPosition){
//     if (resumeData.education?.length) {
//     yPosition = checkPageBreak(40);
//     yPosition += 20;

//     doc.font('Helvetica-Bold')
//        .fontSize(12)
//        .text('EDUCATION', 50, yPosition);
//     yPosition += 20;

//     resumeData.education.forEach(edu => {

//       yPosition = checkPageBreak(40);
//       yPosition += 15;

//       doc.font('Helvetica-Bold')
//          .fontSize(10)
//          .text(`${cleanText(edu.degree)} | ${cleanText(edu.institution)}`, 50, yPosition);
//       yPosition += 15;
//       doc.font('Helvetica')
//          .fontSize(9)
//          .fillColor(secondaryColor)
//          .text(cleanText(edu.year), 50, yPosition);
//       yPosition += 25;
//     });
//   }
// }



// function generateCertificatePDF(resumeData, doc, yPosition){
//    if (resumeData.certificates?.name) {
//     yPosition = checkPageBreak(40);
//     yPosition += 20;

//     doc.font('Helvetica-Bold')
//        .fontSize(12)
//        .text('CERTIFICATIONS', 50, yPosition);
//     yPosition += 20;

//     const certs = cleanList(resumeData.certificates.name);
//     certs.forEach(cert => {
//       doc.font('Helvetica')
//          .fontSize(10)
//          .text(`• ${cert}`, 50, yPosition);
//       yPosition += 15;
//     });
//     yPosition += 10;
//   }
// }


// function generateAwardsPDF(resumeData, doc, yPosition){
//     if (resumeData.awards?.title) {
//     yPosition = checkPageBreak(40);
//     yPosition += 20;

//     doc.font('Helvetica-Bold')
//        .fontSize(12)
//        .text('AWARDS', 50, yPosition);
//     yPosition += 20;

//     const awards = cleanList(resumeData.awards.title);
//     awards.forEach(award => {
//       doc.font('Helvetica')
//          .fontSize(10)
//          .text(`• ${award}`, 50, yPosition);
//       yPosition += 15;
//     });
//     yPosition += 10;
//   }
// }





// function generateLanguagePDF(resumeData, doc, yPosition){
//    if (resumeData.languages?.name) {
//     yPosition = checkPageBreak(40);
//     yPosition += 20;

//     doc.font('Helvetica-Bold')
//        .fontSize(12)
//        .text('LANGUAGES', 50, yPosition);
//     yPosition += 20;

//     const languages = cleanList(resumeData.languages.name);
//     languages.forEach(lang => {
//       doc.font('Helvetica')
//          .fontSize(10)
//          .text(`• ${lang}`, 50, yPosition);
//       yPosition += 15;
//     });
//   }
// }