import {updateContactInfo, addExperience, addOrUpdateSkills, addEducation, addOrUpdateSummary, addOrUpdateLanguages, addOrUpdateCertificates, addOrUpdateAwards, getResumeInfo,  editExperience, editEducation, downloadResume, addOrUpdateIntrest, addProjects, deleteEducation, deleteExperience, deleteProject} from "../controllers/resume.js"
import auth from "../middleware/auth.js"
import {thirdPartyStrictLimiter} from "../middleware/rateLimitter.js"
import {checkPermission} from "../middleware/access.js"
import express from 'express';
const router=express.Router()

router.post("/updateContactInfo", auth, checkPermission("EDIT_RESUME"), updateContactInfo)
router.post("/addExperience", auth, checkPermission("EDIT_RESUME"), addExperience)
router.post("/addEducation", auth, checkPermission("EDIT_RESUME"), addEducation)
router.post("/addProject", auth, checkPermission("EDIT_RESUME"), addProjects)
router.put("/addOrUpdateSkills", auth, checkPermission("EDIT_RESUME"), addOrUpdateSkills)
router.put("/updateSummary", auth, checkPermission("EDIT_RESUME"), addOrUpdateSummary)
router.put("/updateLanguages", auth, checkPermission("EDIT_RESUME"), addOrUpdateLanguages)
router.put("/updateCertificates", auth, checkPermission("EDIT_RESUME"), addOrUpdateCertificates)
router.put("/updateAwards", auth, checkPermission("EDIT_RESUME"), addOrUpdateAwards)
router.put("/updateIntrest", auth, checkPermission("EDIT_RESUME"), addOrUpdateIntrest)
router.get("/getResumeInfo", auth, getResumeInfo)
router.get("/downloadResume", thirdPartyStrictLimiter, auth, checkPermission("DOWNLOAD_RESUME"), downloadResume)
router.patch("/editExperience", auth, checkPermission("EDIT_RESUME"), editExperience)
router.patch("/updateEditEducation", auth, checkPermission("EDIT_RESUME"), editEducation)
router.delete("/deleteEducation/:educationId", auth, checkPermission("DELETE_RESUME_FIELD"), deleteEducation)
router.delete("/deleteExperience/:experienceId", auth, checkPermission("DELETE_RESUME_FIELD"), deleteExperience)
router.delete("/deleteProject/:projectId", auth, checkPermission("DELETE_RESUME_FIELD"), deleteProject)

export default router;