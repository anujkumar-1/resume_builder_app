import {OAuth2Client } from "google-auth-library"
import jwt from 'jsonwebtoken';
import User from "../models/user.js"

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const client = new OAuth2Client(CLIENT_ID)

export function generateAccessTokens(id, name, email){
    const token = jwt.sign({userId: id, name:name, email}, process.env.JWT_TOKEN_SECRET)
    return token
}

export const googleSignup = async (req, res) =>{
    try {
         const {token} = req.body
         if(!token){
            return res.status(400),json({success: false, message: "Bad Request"})
         }

         const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload) {
            throw new Error('Verification succeeded but payload is missing.');
        }
    
        if (payload) {
            let sub = payload.sub
            let email = payload.email
            if(!sub){
                throw new Error('Verification succeeded but payload is missing.');
            }

            const emailExist = await User.findOne({email: email})
            if(!emailExist){
                // user is new user confirmed
                const user = await User.create({sub: sub, picture: payload.picture, given_name: payload.given_name, email:payload.email, username: payload.name })
                return res.status(201).json({success: true, message: "User authorized successfully", token : generateAccessTokens(user._id, user.username, user.email)})
            }
            // user is not new user 
            return res.status(200).json({success: true, message: "User authorized successfully"})
        }

    } catch (error) {
          return res.status(401).json({success: false, message: "Unauthorize user"})
    }
}


export const googleLogin= async(req, res)=>{
    try {
        
        const {token} = req.body
        if(!token){
           return res.status(400),json({success: false, message: "Bad Request"})
         }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        console.log(payload)
        if (!payload) {
            throw new Error('Verification succeeded but payload is missing.');
        }
        if (payload) {
            let email = payload.email

            const emailExist = await User.findOne({email: email})
            if(!emailExist){
                // user is new user confirmed
                const user = await User.create({sub: sub, picture: payload.picture, given_name: payload.given_name, email:payload.email, username: payload.name })
                return res.status(201).json({success: true, message: "User authorized successfully", token : generateAccessTokens(user._id, user.username, user.email)})
            }

            return res.status(200).json({success: true, message: "User authorized successfully", payload})
        }

    } catch (error) {
           return res.status(401).json({success: false, message: "Unauthorize user"})
    }
}