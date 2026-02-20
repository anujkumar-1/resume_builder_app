import {signUp, login} from "../controllers/user.js";


import express from 'express';
const router=express.Router()


router.post("/signup", signUp)
router.get("/login", login)


export default router;