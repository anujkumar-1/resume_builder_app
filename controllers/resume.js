import {User, Resume} from "../models/index.js"
import AppError from "../utils/appError.js";
import {catchAsync} from "../utils/catchAsync.js"
import crypto from 'node:crypto';
import mongoose from 'mongoose';

// import {generateAndUploadResume} from "./helpers.js"
import {generateAndUploadResume, TEMPLATE_TYPES} from "./resumeFactory.js"

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


export const updateContactInfo = catchAsync(async (req, res, next) => {
    const {name, email, phone} = req.body
    console.log(name, email, phone)

    if(!name || !email || !phone) {
        return next(new AppError("Bad Request, Parameter missing", 400));
    }

    const updatedUser = await Resume.findOneAndUpdate(
        { user:req.user._id }, 
        { 
            $set: {
                contactInfo: { name, email, phone}
            }
        }, 
        { 
            upsert: true,
            new: true
        }
    ).select('contactInfo')
    .lean();
    if(!updatedUser){
        return next(new AppError("Id not found", 500));
    }

    return res.status(200).json({contactInfo: updatedUser.contactInfo})
})


export const addExperience = catchAsync(async (req, res, next) => {
    const {role, company, startDate, endDate, description} = req.body
    const current = endDate === "present";

    if(!role || !company || !startDate || !endDate || !description){
        return next(new AppError("Bad Request, Parameter missing", 400));
    }

    const experienceId = new mongoose.Types.ObjectId()
    const targetExperience = {
        _id: experienceId,
        role,
        company,
        startDate,
        endDate,
        current,
        description
    }
    const updatedExperience= await Resume.findOneAndUpdate(
        { user:req.user._id },
        {
            $push: {
                experience: targetExperience
            },
        },
        { 
            projection: {experience: 1},
            upsert: true,
            new: true
        }
    ).lean()

    if (!updatedExperience) {
        return next(new AppError("Failed to update experience", 500));
    }

    const pushedExperience = updatedExperience.experience?.find(
        (experience)=> experience._id.toString()=== experienceId.toString()
    )
    const newExperience = pushedExperience || targetExperience
    return res.status(200).json({newExperience})
})

export const addOrUpdateSkills = catchAsync(async (req, res, next) => {
    const skill = req.body.skill
    if(!skill){
        return next(new AppError("Bad Request, Parameter missing", 400));
    }
    const updatedSkill = await Resume.findOneAndUpdate(
        { user:req.user._id },
        {
            $set: {  
                skills: skill  
            }
        },
        { 
            upsert: true,
            new: true 
        }
    ).select('skills')
    .lean();


    if(!updatedSkill){
        return next(new AppError("Failed to update resume data", 500));
    }
    return res.status(200).json({updatedSkill})
})



export const addEducation = catchAsync(async (req, res, next) => {
    const {degree, institution, year} = req.body

    if(!degree || !institution || !year){
        return next(new AppError("Bad Request, Parameter missing", 400));
    }

    const educationId = new mongoose.Types.ObjectId()

    const targetEducation = {
        _id: educationId,
        degree,
        institution,
        year,
    }
    const updatedEducation = await Resume.findOneAndUpdate(
        { user:req.user._id },
        {
            $push: {education: targetEducation}
        },
        { 
            projection: {education: 1},
            upsert: true,
            new: true,
        }
    ).lean()

    if(!updatedEducation) {
        return next(new AppError("Failed to update resume education", 500));
    }

    const pushedEducation = updatedEducation.education?.find(
        (education)=> education._id.toString() === educationId.toString()
    )
    const newEducation = pushedEducation || targetEducation
    return res.status(200).json({newEducation});
})


export const addOrUpdateSummary = catchAsync(async (req, res, next) => {
    const {summary} = req.body

    if(!summary){
        return next(new AppError("Missing parameter, Bad Request", 400));
    }

    const updatedSummary = await Resume.findOneAndUpdate(
        { user:req.user._id },
        { $set: { summary: summary } },
        {
            upsert: true,
            new: true 
        }
    ).select("summary").lean()

    if(!updatedSummary){
        return next(new AppError("Failed to update summary", 500))
    }
    res.status(200).json({updatedSummary})
})



export const addOrUpdateLanguages = catchAsync(async (req, res, next) => {
    const {language} = req.body
    if(!language){
        return next(new AppError("Missing parameter, Bad Request", 400))
    }

    const updateLanguage = await Resume.findOneAndUpdate(
        { user:req.user._id },
        {
            $set: {
                languages:language
            }
        },
        { 
            upsert: true,
            new: true
        }
    ).select("languages").lean()

    if(!updateLanguage){
        return next(new AppError("Failed to update language", 500))
    }
    res.status(200).json({updateLanguage})

})


export const addOrUpdateCertificates = catchAsync(async (req, res, next) => {
    const {certificate} = req.body
    if(!certificate){
        return next(new AppError("Bad Request, Parameter missing", 400))
    }

    const updatedCertificate = await Resume.findOneAndUpdate(
        { user:req.user._id },
        {
            $set: {
                certificates:  certificate 
            }
        },
        { 
            upsert: true,
            new: true 
        }
    ).select("certificates").lean()

    if(!updatedCertificate){
        return next(new AppError("Failed to update certificate", 500))
    }
    res.status(200).json({updatedCertificate})
})


export const addOrUpdateAwards = catchAsync(async (req, res, next) => {
    const {awards} = req.body
    if(!awards){
        return next(new AppError("Bad Request, Parameter missing", 400))
    }
    const updatedAward = await Resume.findOneAndUpdate(
        { user:req.user._id },
        {
            $set : {
                awards: awards
            }
        },
        { 
            upsert: true,
            new: true 
        }
    ).select("awards").lean()

    if(!updatedAward){
        return next(new AppError("Failed to update awards", 500))
    }
    res.status(200).json({updatedAward})
})

export const addOrUpdateIntrest = catchAsync(async (req, res, next) =>{
    const intrest = req.body.intrest
    if(!intrest){
        return next(new AppError("Bad Request, Parameter missing", 400))
    }

    const updatedIntrest = await Resume.findOneAndUpdate(
        {user:req.user._id},
        {
            $set: {  
                intrests: intrest  
            }
        },
        { new: true }
    ).select("intrests").lean()

    if(!updatedIntrest){
        return next(new AppError("Failed to update Intrest", 500))
    }

    res.status(200).json({updatedIntrest})
})

export const addProjects = catchAsync(async (req, res, next) => {
    const {title, summary, startDate, endDate, description} = req.body

    console.log(title, summary, startDate, endDate, description)
    if(!title || !summary || !startDate || !description){
        return next(new AppError("Bad Request, Parameter missing", 400))
    }
    const serverGeneratedId = new mongoose.Types.ObjectId();

    const targetProject = {
        _id: serverGeneratedId,
        title, 
        summary,
        startDate, 
        endDate, 
        description
    };

    const updatedProject = await Resume.findOneAndUpdate(
        { user:req.user._id },
        {
            $push: { projects:  targetProject}
        },
        { 
            upsert: true,
            new: true,
            projection: {projects: 1 }
        }
    ).lean()

    if(!updatedProject){
        return next(new AppError("Failed to update project", 500))
    }

    const pushedProject = updatedProject.projects?.find(
        (proj) => proj._id.toString() === serverGeneratedId.toString()
    )
    const newProject = pushedProject || targetProject;

    // 6. Send clean response
    res.status(200).json({newProject});

})

export const getResumeInfo = catchAsync(async (req, res, next)=>{
    
    const [userInfo, resumeInfo] = await Promise.all([
        User.findOne({ _id:req.user._id }).select("username email mobile").lean(),
        
        Resume.findOne({ user:req.user._id }
        ).select("summary experience education skills languages certificates intrests projects awards").lean()
    ])

    res.status(200).json({userInfo, resumeInfo})

})

export const editExperience = catchAsync(async (req, res, next)=>{
    const {editJob, editCompany, startDate, endDate, editDescription, uid} = req.body

    if(!editJob || !editCompany || !startDate || !endDate || !editDescription  || !uid){
        return next(new AppError("Bad Request, Parameter missing", 400));
    }

    const editingExperience = await Resume.findOneAndUpdate(
        {
            "user":req.user._id,
            "experience._id": uid
        },
        {
            $set: {
            "experience.$.role": editJob,
            "experience.$.company": editCompany,
            "experience.$.startDate": startDate,
            "experience.$.endDate": endDate,
            "experience.$.description": editDescription
            }
        },
        {
            new: true, 
            projection: { experience: 1 } 
        }
    ).lean()

    if (!editingExperience) {
        return next(new AppError("Experience not found", 404))
    }

    const requiredExperience = editingExperience.experience?.find(
        (experience)=>experience._id.toString() === uid.toString()
    )
    res.status(200).json({requiredExperience})

})


export const editEducation = catchAsync(async (req, res, next)=>{
    const {editDegree, editInstitution,editDuration , euid} = req.body
    if(!editDegree || !editInstitution || !editDuration || !euid){
        return next(new AppError("Bad Request, Parameter missing", 400))
    }
    const editingEducation = await Resume.findOneAndUpdate(
        {
            "user":req.user._id,
            "education._id": euid
        },
        {
            $set: {
                "education.$.degree": editDegree,
                "education.$.institution": editInstitution,
                "education.$.year": editDuration,
            }
        },
        {
            new: true,
            projection: { education: 1 } 
        }
    ).lean()

    if (!editingEducation) {
        return next(new AppError("Education not found", 404))
    }
    const updatedEducation = editingEducation.education?.find(
        (edu)=> edu._id.toString() === euid.toString()
    )
    res.status(200).json({ updatedEducation})

})

export const downloadResume = catchAsync(async (req, res, next) => {
    const uuid = crypto.randomUUID();
    const color = req.query.color
    const theme = req.query.theme
    console.log(color, COLOR_SCHEMES[color])
    // name
    const filename = `Resume-${req.user.name}-${uuid}.pdf`;
    const updatedUser = await User.findOne({ _id:req.user._id });
    if(!updatedUser){
        return next(new AppError("User does not exist", 404))
    }
    const resumeData = await Resume.findOne({ user:req.user._id });
    if(!resumeData){
        return next(new AppError("Resume does not exist", 404))
    }
    const mergedData = mergeUserWithResumeData(updatedUser, resumeData)

    const s3Data = await generateAndUploadResume(mergedData, theme, COLOR_SCHEMES[color], null)
    if(!s3Data){
        return next(new AppError("Server error, please try again", 500))

    }
    res.status(200).json({updatedUser, s3Data})

})

export const deleteEducation = catchAsync(async(req, res, next)=>{
    const {educationId} = req.params
    if(!educationId ||  !mongoose.Types.ObjectId.isValid(educationId)){
        return next(new AppError("Bad request", 400))
    }
    const deletedEducation = await Resume.updateOne(
        {"user":req.user._id},
        { 
            $pull: { 
                education: { "_id":  new mongoose.Types.ObjectId(educationId)} 
            } 
        }
    )

    if(!deletedEducation.modifiedCount){
        return next(new AppError ("Item not found or already deleted.",404))
    }
    return res.status(200).send({message:"Item removed successfully.", success: true});
})

export const deleteExperience = catchAsync(async(req, res, next)=>{
    const {experienceId} = req.params
    if(!experienceId || !mongoose.Types.ObjectId.isValid(experienceId)){
        return next(new AppError("Bad Request", 400))
    }
    const deletedExperience = await Resume.updateOne(
        {"user":req.user._id},
        { 
            $pull: { 
                experience: { "_id":  new mongoose.Types.ObjectId(experienceId)} 
            } 
        }
    )

    if(!deletedExperience.modifiedCount){
        return next(new AppError("Item not found or already deleted.", 404))
    }
    return res.status(200).send({message: "experience deleted successfully", success: true})
})

export const deleteProject= catchAsync(async(req, res, next)=>{
    const {projectId} = req.params
    if(!projectId || !mongoose.Types.ObjectId.isValid(projectId)){
        return next(new AppError("Bad Request", 400))
    }

    const deletedProject = await Resume.updateOne(
        {"user":req.user._id},
        { 
            $pull: { 
                projects: { "_id":  new mongoose.Types.ObjectId(projectId)} 
            } 
        }
    )

    if(!deletedProject.modifiedCount){
        return next(new AppError("Item not found or already deleted.", 404))
    }
    return res.status(200).send({message:"Item removed successfully.", success: true});


})


function mergeUserWithResumeData(userData, customResumeData) {
    // Extract user info from the _doc property
    const user = userData;
    
    // Create the resume data structure
    const resumeData = {
        personalInfo: {
            name: user.username,
            title: customResumeData.title || "Backend Engineer",
            email: user.email,
            phone: user.mobile,
            location: user.location
        },
        contact: {
            phone: user.mobile,
            email: user.email,
            address: user.location || '',
        },
        summary: customResumeData.summary,
        education: customResumeData.education,
        skills: customResumeData.skills,
        languages: customResumeData.languages,
        certificates: customResumeData.certificates,
        awards: customResumeData.awards,
        projects: customResumeData.projects,
        experience: customResumeData.experience,
        references: customResumeData.references
    };
    
    return resumeData;
}