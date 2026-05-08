import {updateContactInfo, updateExperience, updateSkills, updateEducation, updateSummary, updateLanguages, updateCertificates, updateAwards, getResumeInfo,  updateEditExperience, updateEditEducation, downloadResume, updateIntrest, updateProjects, deleteEduItem, deleteExpItem, deleteProjectItem} from "../controllers/resume.js"
import auth from "../middleware/auth.js"
import {thirdPartyStrictLimiter} from "../middleware/rateLimitter.js"
import {checkPermission} from "../middleware/access.js"
import express from 'express';
const router=express.Router()

router.post("/updateContactInfo", auth, checkPermission("EDIT_RESUME"), updateContactInfo)
router.post("/updateExperience", auth, checkPermission("EDIT_RESUME"), updateExperience)
router.post("/updateSkills", auth, checkPermission("EDIT_RESUME"), updateSkills)
router.post("/updateEducation", auth, checkPermission("EDIT_RESUME"), updateEducation)
router.post("/updateSummary", auth, checkPermission("EDIT_RESUME"), updateSummary)
router.post("/updateLanguages", auth, checkPermission("EDIT_RESUME"), updateLanguages)
router.post("/updateCertificates", auth, checkPermission("EDIT_RESUME"), updateCertificates)
router.post("/updateAwards", auth, checkPermission("EDIT_RESUME"), updateAwards)
router.post("/updateIntrest", auth, checkPermission("EDIT_RESUME"), updateIntrest)
router.post("/updateProject", auth, checkPermission("EDIT_RESUME"), updateProjects)
router.get("/getResumeInfo", auth, getResumeInfo)
router.post("/updateEditExperience", auth, checkPermission("EDIT_RESUME"), updateEditExperience)
router.post("/updateEditEducation", auth, checkPermission("EDIT_RESUME"), updateEditEducation)
router.get("/downloadResume", thirdPartyStrictLimiter, auth, checkPermission("DOWNLOAD_RESUME"), downloadResume)
router.delete("/deleteEducationItem", auth, checkPermission("DELETE_RESUME_FIELD"), deleteEduItem)
router.delete("/deleteExperienceItem", auth, checkPermission("DELETE_RESUME_FIELD"), deleteExpItem)
router.delete("/deleteProjectItem", auth, checkPermission("DELETE_RESUME_FIELD"), deleteProjectItem)

export default router;