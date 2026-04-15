import Resume from "../models/resumeBuilder.js"
import User from "../models/user.js"
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


export const updateContactInfo = async (req, res) => {
    try {
        const name = req.body.name
        const email = req.body.email
        const phone = req.body.phone

        if(!name || !email || !phone) {
            res.status(400).json({success: false, message: "Bad Request, Parameter missing"})
        }

        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user.userId }, 
            { 
                $set: { 
                username: name,
                email: email,
                mobile: phone 
                } 
            }, 
            { new: true } // Return the updated document
        );

        res.status(200).json({updatedUser})

    } catch (error) {
        console.log(error)
    }
}

export const updateExperience = async (req, res) => {
    try {
        const {title, company, startDate, endDate, description, experienceId} = req.body
        const isCurrentPosition = endDate === "present";

        if(!title || !company || !startDate || !endDate || !description){
            res.status(400).json({success: false, message: "Bad Request, Parameter missing"})
        }

        const userAlreadyExist = await Resume.find({ user: req.user.userId });
        
        if(userAlreadyExist.length > 0){

            const updatedResume = await Resume.findOneAndUpdate(
                { user: req.user.userId },
                {
                    $push: {
                    experience: {
                        role: title,
                        company: company,
                        startDate: startDate,
                        endDate: endDate,
                        current: isCurrentPosition,
                        description: description,
                        experienceId: experienceId
                    }
                    }
                },
                { new: true }
            );
            res.status(200).json({updatedResume})

        }
        else{
            const data = await Resume.create({user: req.user.userId,
                experience: [{
                    role: title,
                    company: company,
                    startDate: startDate,
                    endDate: endDate,
                    current: isCurrentPosition,
                    description: description,
                    experienceId: experienceId
                }]
            })
            
            res.status(201).json({data})

        }

    } catch (error) {
        console.log(error)
    }
}

export const updateSkills = async (req, res) => {
    try {
        const skill = req.body.skill
        if(!skill){
            res.status(400).json({success: false, message: "Bad Request, Parameter missing"})
        }
        const userAlreadyExist = await Resume.find({ user: req.user.userId });

        if (userAlreadyExist.length >0) {
            const updatedResume = await Resume.findOneAndUpdate(
                { user: req.user.userId },
                {
                    $set: {  
                        skills: skill  
                    }
                },
                { new: true }
            );
            res.status(200).json({updatedResume})
        }
        else{
            const data = await Resume.create({user: req.user.userId,
                skills: skill
            })
            
            res.status(201).json({data})
        }
    } catch (error) {
        res.status(500).json({success: false, message: "Internal Server Error, Please Try Again Later"})
    }
}

export const updateEducation = async (req, res) => {
    try {
        const {degree, institution, duration, id} = req.body

        if(!degree || !institution || !duration || !id){
            res.status(400).json({success: false, message: "Bad Request, Parameter missing"})
        }
        const userAlreadyExist = await Resume.find({ user: req.user.userId });

        if (userAlreadyExist.length >0) {
            const updatedResume = await Resume.findOneAndUpdate(
                { user: req.user.userId },
                {
                    $push: {
                    education: {
                        degree: degree,
                        institution: institution,
                        year: duration,
                        educationId: id
                    }
                    }
                },
                { new: true }
            );
            res.status(200).json({updatedResume})
        }
        else{
            const data = await Resume.create({user: req.user.userId,
                education: [{
                    degree: degree,
                    institution: institution,
                    year: duration,
                    educationId: id
                }]
            })
            
            res.status(201).json({data})
        }
    } catch (error) {
        res.status(500).json({success: false, message: "Internal Server Error, Please Try Again Later"})
    }
}


export const updateSummary = async (req, res) => {
    try {
        const {summary} = req.body

        if(!summary){
            res.status(400).json({success: false, message: "Bad Request, Parameter missing"})
        }
        const userAlreadyExist = await Resume.find({ user: req.user.userId });

        if (userAlreadyExist.length > 0) {
            const updatedResume = await Resume.findOneAndUpdate(
                { user: req.user.userId },
                { $set: { summary: summary } },
                { new: true }
            );
            res.status(200).json({updatedResume})
        }
        else{
            const data = await Resume.create({
                user: req.user.userId,
                summary: summary,
            })
            
            res.status(201).json({data})
        }
    } catch (error) {
        res.status(500).json({success: false, message: "Internal Server Error, Please Try Again Later"})
    }
}



export const updateLanguages = async (req, res) => {
    try {
        const {language} = req.body
        if(!language){
            res.status(400).json({success: false, message: "Bad Request, Parameter missing"})
        }
        const userAlreadyExist = await Resume.find({ user: req.user.userId });

        if (userAlreadyExist.length >0) {
            const updatedResume = await Resume.findOneAndUpdate(
                { user: req.user.userId },
                {
                    $set: {
                        languages:language
                    }
                },
                { new: true }
            );
            res.status(200).json({updatedResume})
        }
        else{
            const data = await Resume.create({user: req.user.userId,
                languages: language
            })
            
            res.status(201).json({data})
        }
    } catch (error) {
        res.status(500).json({success: false, message: "Internal Server Error, Please Try Again Later"})
    }
}


export const updateCertificates = async (req, res) => {
    try {
        const {certificate} = req.body
        if(!certificate){
            res.status(400).json({success: false, message: "Bad Request, Parameter missing"})
        }
        const userAlreadyExist = await Resume.find({ user: req.user.userId });

        if (userAlreadyExist.length >0) {
            const updatedResume = await Resume.findOneAndUpdate(
                { user: req.user.userId },
                {
                    $set: {
                        certificates:  certificate 
                    }
                },
                { new: true }
            );
            res.status(200).json({updatedResume})
        }
        else{
            const data = await Resume.create({user: req.user.userId,
                certificates: certificate
            })
            
            res.status(201).json({data})
        }
    } catch (error) {
        res.status(500).json({success: false, message: "Internal Server Error, Please Try Again Later"})
    }
}


export const updateAwards = async (req, res) => {
    try {
        const {awards} = req.body
        if(!awards){
            res.status(400).json({success: false, message: "Bad Request, Parameter missing"})
        }
        const userAlreadyExist = await Resume.find({ user: req.user.userId });

        if (userAlreadyExist.length >0) {
            const updatedResume = await Resume.findOneAndUpdate(
                { user: req.user.userId },
                {
                    $set : {
                        awards: awards
                    }
                },
                { new: true }
            );
            res.status(200).json({updatedResume})
        }
        else{
            const data = await Resume.create({user: req.user.userId,
                awards: awards
            })
            
            res.status(201).json({data})
        }
    } catch (error) {
        res.status(500).json({success: false, message: "Internal Server Error, Please Try Again Later"})
    }
}

export const updateIntrest = async (req, res) =>{
    try {
        const intrest = req.body.intrest
        if(!intrest){
            res.status(400).json({success: false, message: "Bad Request, Parameter missing"})
        }
        const userAlreadyExist = await Resume.find({user: req.user.userId });

        if (userAlreadyExist.length >0) {
            const updatedResume = await Resume.findOneAndUpdate(
                {user: req.user.userId},
                {
                    $set: {  
                        intrests: intrest  
                    }
                },
                { new: true }
            );
            res.status(200).json({updatedResume})
        }
        else{
            const data = await Resume.create({user: req.user.userId,
                intrests: intrest
            })
            
            res.status(201).json({data})
        }
    } catch (error) {
        res.status(500).json({success: false, message: "Internal Server Error, Please Try Again Later"})
    }
}

export const updateProjects = async (req, res) => {
    try {
        const {title, summary, startDate, endDate, description, projectId} = req.body
        console.log(title, summary, startDate, endDate, description, projectId)
        if(!title || !summary || !startDate || !description || !projectId){
            res.status(400).json({success: false, message: "Bad Request, Parameter missing"})
        }

        const userAlreadyExist = await Resume.find({ user: req.user.userId });
        
        if(userAlreadyExist.length > 0){

            const updatedResume = await Resume.findOneAndUpdate(
                { user: req.user.userId },
                {
                    $push: {
                    projects: {
                        title: title,
                        description: description,
                        startDate: startDate,
                        endDate: endDate,
                        summary: summary,
                        projectId: projectId
                    }
                    }
                },
                { new: true }
            );
            res.status(200).json({updatedResume})

        }
        else{
            const data = await Resume.create({user: req.user.userId,
                projects: [{
                    title: title,
                    description: description,
                    startDate: startDate,
                    endDate: endDate,
                    summary: summary,
                    projectId: projectId
                }]
            })
            res.status(201).json({data})  

        }    
    }catch (error) {
        res.status(500).json({success: false, message: "Internal Server Error, Please Try Again Later"})
    }
}

export const getResumeInfo = async (req, res)=>{
    try {
        const response = await User.find({ _id: req.user.userId })
        const resume = await Resume.find({ user: req.user.userId })

        res.status(200).json({userInfo: response, resumeInfo: resume})
        
    } catch (error) {
        res.status(500).json({success: false, message: "Internal Server Error, Please Try Again Later"})
    }
}

export const updateEditExperience = async (req, res)=>{
    try {
        const {editJob, editCompany, startDate, endDate, editDescription, id, uid} = req.body

        if(!editJob || !editCompany || !startDate || !endDate || !editDescription || !id || !uid){
            res.status(400).json({success: false, message: "Bad Request, Parameter missing"})
        }
        // This will update the matching experience without needing to know its index

        if(uid != "undefined"){
            const result = await Resume.findOneAndUpdate(
                {
                    "user": req.user.userId,
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
                    returnDocument: 'after', // Return the updated document
                    projection: { experience: 1 } // Only return experiences array if needed
                }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: "Experience not found" });
            }
            res.status(200).json({ message: "Experience updated successfully",result})
        }
        else{
            const result = await Resume.findOneAndUpdate(
                {
                    "user": req.user.userId,
                    "experience.experienceId": id
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
                    returnDocument: 'after', // Return the updated document
                    projection: { experience: 1} // Only return experiences array if needed
                }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: "Experience not found" });
            }
            res.status(200).json({ message: "Experience updated successfully",result})
        }
       
        
    } catch (error) {
        console.error("Error updating experience:", error);
        res.status(500).json({ message: "Failed to update experience" });
    }
}


export const updateEditEducation = async (req, res)=>{
    try {
        const {editDegree, editInstitution,editDuration , id, euid} = req.body
        console.log(editDegree, editInstitution, editDuration, id, euid)
        if(!editDegree || !editInstitution || !editDuration  || !id || !euid){
            res.status(400).json({success: false, message: "Bad Request, Parameter missing"})
        }
        if(euid != "undefined"){
            const result = await Resume.findOneAndUpdate(
                {
                    "user": req.user.userId,
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
                    returnDocument: 'after', // Return the updated document
                    projection: { education: 1 } // Only return experiences array if needed
                }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: "Education not found" });
            }
            res.status(200).json({ message: "Education updated successfully",result})
        }
        else{
            const result = await Resume.findOneAndUpdate(
                {
                    "user": req.user.userId,
                    "education.educationId": id
                },
                {
                    $set: {
                        "education.$.degree": editDegree,
                        "education.$.institution": editInstitution,
                        "education.$.year": editDuration,
                    }
                },
                {
                    returnDocument: 'after', // Return the updated document
                    projection: { education: 1 } // Only return experiences array if needed
                }
            );
            if (result.matchedCount === 0) {
                return res.status(404).json({ message: "education not found" });
            }
            res.status(200).json({ message: "education updated successfully",result})
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to update Education" });
    }
}

export const downloadResume = async (req, res) => {
    try {
        const uuid = crypto.randomUUID();
        const color = req.query.color
        const theme = req.query.theme
        console.log(color, COLOR_SCHEMES[color])
        // name
        const filename = `Resume-${req.user.name}-${uuid}.pdf`;
        const resumeData = await Resume.findOne({ user: req.user.userId });
        const updatedUser = await User.findOne({ _id: req.user.userId });
        const mergedData = mergeUserWithResumeData(updatedUser, resumeData)
        const s3Data = await generateAndUploadResume(mergedData, theme, COLOR_SCHEMES[color], null)
        res.status(200).json({updatedUser, s3Data})
    } catch (error) {
        res.status(500).json({ message: "Internal server error, please try again later" });
    }
}

export const deleteEduItem = async(req, res)=>{
    try {
        const {id, fallbackId} = req.body
        console.log(id, fallbackId)
        if (id && mongoose.Types.ObjectId.isValid(id)) {
            const result = await Resume.updateOne(
                {"user": req.user.userId},
                { 
                    $pull: { 
                        education: { "_id":  new mongoose.Types.ObjectId(id)} 
                    } 
                }
            )

            if(result.modifiedCount ==0){
                return res.status(404).send("Item not found or already deleted.");
            }
            return res.status(200).send("Item removed successfully.");

        }
        else if (fallbackId) {
            const result = await Resume.updateOne(
                {"user": req.user.userId},
                { 
                    $pull: { 
                        education: { "educationId":  fallbackId} 
                    } 
                }
            )

            if(result.modifiedCount ==0){
                return res.status(404).send("Item not found or already deleted.");
            }
            return res.status(200).send("Item removed successfully.");
        }
        return res.status(400).json({ message: "No valid IDs provided" });
        
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error.");
    }
}

export const deleteExpItem = async(req, res)=>{
    try {
        const {id, fallbackId} = req.body
        console.log(id, fallbackId)
        if (id && mongoose.Types.ObjectId.isValid(id)) {
            const result = await Resume.updateOne(
                {"user": req.user.userId},
                { 
                    $pull: { 
                        experience: { "_id":  new mongoose.Types.ObjectId(id)} 
                    } 
                }
            )

            if(result.modifiedCount ==0){
                return res.status(404).send("Item not found or already deleted.");
            }
            return res.status(200).send("Item removed successfully.");

        }
        else if (fallbackId) {
            const result = await Resume.updateOne(
                {"user": req.user.userId},
                { 
                    $pull: { 
                        experience: { "experienceId":  fallbackId} 
                    } 
                }
            )

            if(result.modifiedCount ==0){
                return res.status(404).send("Item not found or already deleted.");
            }
            return res.status(200).send("Item removed successfully.");
        }
        return res.status(400).json({ message: "No valid IDs provided" });
        
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error.");
    }
}


export const deleteProjectItem= async(req, res)=>{
    try {
        const {id, fallbackId} = req.body
        console.log(id, fallbackId)
        if (id && mongoose.Types.ObjectId.isValid(id)) {
            const result = await Resume.updateOne(
                {"user": req.user.userId},
                { 
                    $pull: { 
                        projects: { "_id":  new mongoose.Types.ObjectId(id)} 
                    } 
                }
            )

            if(result.modifiedCount ==0){
                return res.status(404).send("Item not found or already deleted.");
            }
            return res.status(200).send("Item removed successfully.");

        }
        else if (fallbackId) {
            const result = await Resume.updateOne(
                {"user": req.user.userId},
                { 
                    $pull: { 
                        projects: { "projectId":  fallbackId} 
                    } 
                }
            )

            if(result.modifiedCount ==0){
                return res.status(404).send("Item not found or already deleted.");
            }
            return res.status(200).send("Item removed successfully.");
        }
        return res.status(400).json({ message: "No valid IDs provided" });
        
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error.");
    }
}
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