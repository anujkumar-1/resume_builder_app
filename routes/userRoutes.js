import {signUp, login} from "../controllers/user.js";
import {forgetPassword, resetPassword, updatePassword} from "../controllers/forgetPassord.js"
import {googleSignup, googleLogin} from "../controllers/googleAuth.js"
import auth from "../middleware/auth.js"
import express from 'express';
const router=express.Router()


router.post("/google-signup", googleSignup)
router.post("/google-login", googleLogin)
router.post("/login", login)
router.post("/forgetpassword", auth, forgetPassword)
router.get("/resetpassword/:id",  resetPassword)
router.post("/updatepassword/:resetpasswordid", updatePassword)
router.post("/signup", signUp)


export default router;