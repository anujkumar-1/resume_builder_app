import Resume from "../models/resumeBuilder.js"
import User from "../models/user.js"
import { v4 as uuidv4 } from "uuid";
import {generateAndUploadResume} from "./helpers.js"

export const updateContactInfo = async (req, res) => {
    try {
        const name = req.body.name
        const email = req.body.email
        const phone = req.body.phone


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
        console.log(title, company, startDate, endDate, description, experienceId)
        const isCurrentPosition = endDate === "present";

        const userAlreadyExist = await Resume.find({ user: req.user.userId });
        
        if(userAlreadyExist.length > 0){

            const updatedResume = await Resume.findOneAndUpdate(
                { user: req.user.userId },
                {
                    $push: {
                    experiences: {
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
                experiences: [{
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
        console.log(error)
    }
}

export const updateEducation = async (req, res) => {
    try {
        const {degree, institution, duration, id} = req.body

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
        console.log(error)
    }
}


export const updateSummary = async (req, res) => {
    try {
        const {summary} = req.body

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
        console.log(error)
    }
}



export const updateLanguages = async (req, res) => {
    try {
        const {language} = req.body

        const userAlreadyExist = await Resume.find({ user: req.user.userId });

        if (userAlreadyExist.length >0) {
            const updatedResume = await Resume.findOneAndUpdate(
                { user: req.user.userId },
                {
                    $set: {
                    languages: {
                        name: language
                    }
                    }
                },
                { new: true }
            );
            res.status(200).json({updatedResume})
        }
        else{
            const data = await Resume.create({user: req.user.userId,
                languages: {
                    name: language
                }
            })
            
            res.status(201).json({data})
        }
    } catch (error) {
        console.log(error)
    }
}


export const updateCertificates = async (req, res) => {
    try {
        const {certificate} = req.body

        const userAlreadyExist = await Resume.find({ user: req.user.userId });

        if (userAlreadyExist.length >0) {
            const updatedResume = await Resume.findOneAndUpdate(
                { user: req.user.userId },
                {
                    $set: {
                    certificates: {
                       name: certificate 
                    }
                    }
                },
                { new: true }
            );
            res.status(200).json({updatedResume})
        }
        else{
            const data = await Resume.create({user: req.user.userId,
                certificates: {
                    name: certificate
                }
            })
            
            res.status(201).json({data})
        }
    } catch (error) {
        console.log(error)
    }
}


export const updateAwards = async (req, res) => {
    try {
        const {awards} = req.body

        const userAlreadyExist = await Resume.find({ user: req.user.userId });

        if (userAlreadyExist.length >0) {
            const updatedResume = await Resume.findOneAndUpdate(
                { user: req.user.userId },
                {
                    $set : {
                    awards: {
                       title: awards 
                    }
                    }
                },
                { new: true }
            );
            res.status(200).json({updatedResume})
        }
        else{
            const data = await Resume.create({user: req.user.userId,
                awards: {
                    title: awards
                }
            })
            
            res.status(201).json({data})
        }
    } catch (error) {
        console.log(error)
    }
}

export const updateIntrest = async (req, res) =>{
    try {
        const intrest = req.body.intrest
        console.log(intrest)
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
        console.log(error)
    }
}

export const updateProjects = async (req, res) => {
    try {
        const {title, summary, startDate, endDate, description, projectId} = req.body
        console.log(title, summary, startDate, endDate, description, projectId)

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
        console.log(error)
    }
}

export const getResumeInfo = async (req, res)=>{
    try {
        const response = await User.find({ _id: req.user.userId })
        const resume = await Resume.find({ user: req.user.userId })

        res.status(200).json({userInfo: response, resumeInfo: resume})
        
    } catch (error) {
        console.log(error)
    }
}

export const updateEditExperience = async (req, res)=>{
    try {
        const {editJob, editCompany, startDate, endDate, editDescription, id, uid} = req.body
        console.log(editJob, editCompany, startDate, endDate, editDescription, id, "Abc")
        // This will update the matching experience without needing to know its index

        if(uid != "undefined"){
            const result = await Resume.findOneAndUpdate(
                {
                    "user": req.user.userId,
                    "experiences._id": uid
                },
                {
                    $set: {
                    "experiences.$.role": editJob,
                    "experiences.$.company": editCompany,
                    "experiences.$.startDate": startDate,
                    "experiences.$.endDate": endDate,
                    "experiences.$.description": editDescription
                    }
                },
                {
                    returnDocument: 'after', // Return the updated document
                    projection: { experiences: 1 } // Only return experiences array if needed
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
                    "experiences.experienceId": id
                },
                {
                    $set: {
                    "experiences.$.role": editJob,
                    "experiences.$.company": editCompany,
                    "experiences.$.startDate": startDate,
                    "experiences.$.endDate": endDate,
                    "experiences.$.description": editDescription
                    }
                },
                {
                    returnDocument: 'after', // Return the updated document
                    projection: { experiences: 1 } // Only return experiences array if needed
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
        console.log(error)
    }
}

export const downloadResume = async (req, res) => {
    try {
        const uuid = uuidv4();
        // name
        const filename = `Resume-${req.user.name}-${uuid}.pdf`;

        const resume = await Resume.findOne({ user: req.user.userId });
        const updatedUser = await User.findOne({ _id: req.user.userId });
        console.log(resume, "resu")
        console.log(updatedUser, "updated")

        const s3Data = await generateAndUploadResume(updatedUser, resume, filename)
        console.log("s3Data", s3Data);

        res.status(200).json({resume, updatedUser, s3Data})
    } catch (error) {
        console.log(error)
    }
}