import User from "../models/user.js"
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import axios from 'axios';
import dotenv from "dotenv"
dotenv.config({})
const SECRET_KEY = process.env.GOOGLE_RECAPTCHA_SECRET_ID
async function verifyToken(userToken) {
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${userToken}`;

  try {
    const response = await axios.post(url);
    const { success, score } = response.data;

    if (success) {
      return { verified: true}
    } else {
      return { verified: false};
    }
  } catch (error) {
    console.error("Verification request failed:", error.message);
    throw new Error("Unable to verify reCAPTCHA");
  }
}


export function generateAccessTokens(id, name, email){
    const token = jwt.sign({userId: id, name:name, email}, process.env.JWT_TOKEN_SECRET)
    return token
}


export const signUp = async (req, res)=>{
    try {
        // const t = await sequelize.transaction()
        const {recaptcha_token, name, email, password} = req.body
        const saltRounds = 10
        if(!recaptcha_token || !name || !email || !password){
            return res.status(400).json({success: false, message: "Bad Request"})
        }

        const result = await verifyToken(recaptcha_token)
        if(!result.verified){
            return res.status(400).json({success: false, message: "Bad Request"})
        }

        
        const userAlreadyExist = await User.find({ email: email });
        console.log("userAlreadyExist", userAlreadyExist.length)

        if (userAlreadyExist.length>0) {
            return res.status(409).json({ success: false, message: 'User already exists' });
        }


        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({
            username: name,
            email: email,
            password: hashedPassword
        });

        return res.status(201).json({
            success: true,
            message: "User signed up successfully",
            userId: newUser._id
        });


    } catch (error) {
        console.log("signUp :", error)
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: "Internal server error" });
        }   
    }
}



export const login = async (req, res)=>{
    try {
        const {email, password, captchaToken} = req.body
        console.log(email, password)
        const verifiedEmail = validateEmail(email)
        const verifiedPassword = validatePassword(password)
        if(!email || !password || !captchaToken){
            return res.status(400).json({success: false, message: "Bad Request, Missing email or password or captcha"})
        }
        if(!verifiedEmail || !verifiedPassword){
            return res.status(400).json({success: false, message: "Bad Request, Incorrect email or password"})
        }
        const user = await User.findOne({ email }).select('password username email').lean()
        if(!user){
            return res.status(404).json({success: false, message: "Bad Request, User not found"})
        }

      const isMatch = await bcrypt.compare(password, user.password);
    // 2. Handle the result
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }
            
        const token = generateAccessTokens(user._id, user.username, user.email);
    
        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            token
        });
        
    } catch (error) {
        console.log("login :", error)
        return res.status(500).json({ success: false, message: "Server error during authentication" });
    }
}


function validateEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}


function validatePassword(password){
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password)
}