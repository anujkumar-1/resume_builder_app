import {signUp, login, authenticate} from "../controllers/user.js";
import {forgetPassword, resetPassword, updatePassword} from "../controllers/forgetPassord.js"
import {authLimiter, thirdPartyStrictLimiter} from "../middleware/rateLimitter.js"
import {googleSignup, googleLogin} from "../controllers/googleAuth.js"
import auth from "../middleware/auth.js"
import express from 'express';
const router=express.Router()


router.post("/google-signup", googleSignup)
router.post("/google-login", googleLogin)
router.post("/login", authLimiter, login)
router.post("/forgetpassword", thirdPartyStrictLimiter, auth, forgetPassword)
router.get("/resetpassword/:id",  resetPassword)
router.post("/updatepassword/:resetpasswordid", updatePassword)
router.post("/signup", authLimiter, signUp)
router.get("/authenticate", auth, authenticate)

export default router;