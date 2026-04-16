import {updateContactInfo, updateExperience, updateSkills, updateEducation, updateSummary, updateLanguages, updateCertificates, updateAwards, getResumeInfo,  updateEditExperience, updateEditEducation, downloadResume, updateIntrest, updateProjects, deleteEduItem, deleteExpItem, deleteProjectItem} from "../controllers/resume.js"
import auth from "../middleware/auth.js"
import {thirdPartyStrictLimiter} from "../middleware/rateLimitter.js"

import express from 'express';
const router=express.Router()

router.post("/updateContactInfo", auth, updateContactInfo)
router.post("/updateExperience", auth, updateExperience)
router.post("/updateSkills", auth, updateSkills)
router.post("/updateEducation", auth, updateEducation)
router.post("/updateSummary", auth, updateSummary)
router.post("/updateLanguages", auth, updateLanguages)
router.post("/updateCertificates", auth, updateCertificates)
router.post("/updateAwards", auth, updateAwards)
router.post("/updateIntrest", auth, updateIntrest)
router.post("/updateProject", auth, updateProjects)
router.get("/getResumeInfo", auth, getResumeInfo)
router.post("/updateEditExperience", auth, updateEditExperience)
router.post("/updateEditEducation", auth, updateEditEducation)
router.get("/downloadResume", thirdPartyStrictLimiter, auth, downloadResume)
router.delete("/deleteEducationItem", auth, deleteEduItem)
router.delete("/deleteExperienceItem", auth, deleteExpItem)
router.delete("/deleteProjectItem", auth, deleteProjectItem)

export default router;