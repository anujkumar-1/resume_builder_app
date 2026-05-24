import {signUp, login, authenticate, createOrder, paymentSuccess, paymentFailed} from "../controllers/user.js";
import {forgetPassword, resetPassword, updatePassword} from "../controllers/forgetPassord.js"
import {authLimiter, thirdPartyStrictLimiter, internalApiLimiter} from "../middleware/rateLimitter.js"
import {googleSignup, googleLogin} from "../controllers/googleAuth.js"
import auth from "../middleware/auth.js"
import express from 'express';
import {validateBody} from "../middleware/validate.js"
import {userSignUpSchema} from "../validators/user.js"
const router=express.Router()


router.post("/google-signup", authLimiter, googleSignup)
router.post("/google-login", authLimiter, googleLogin)
router.post("/login", authLimiter, login)
router.post("/forgetpassword", thirdPartyStrictLimiter, auth, forgetPassword)
router.get("/resetpassword/:id",  resetPassword)
router.post("/updatepassword/:resetpasswordid", updatePassword)
router.post("/signup", authLimiter, validateBody(userSignUpSchema), signUp)
router.get("/authenticate", auth, authenticate)
router.post("/create-order", auth, createOrder)
router.post("/payment-success",  paymentSuccess)
router.post("/payment-failed", paymentFailed)


export default router;