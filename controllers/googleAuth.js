import {OAuth2Client } from "google-auth-library"
import jwt from 'jsonwebtoken';
import {User, Role} from "../models/index.js"
import AppError from "../utils/appError.js";
import {catchAsync} from "../utils/catchAsync.js"
import crypto from 'node:crypto';
import mongoose from 'mongoose';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const client = new OAuth2Client(CLIENT_ID)

export function generateAccessTokens(id, name, email, role){
    const token = jwt.sign({userId: id, name:name, email, roleId: role}, process.env.JWT_TOKEN_SECRET, {expiresIn: "15d"})
    return token
}

export const googleSignup = catchAsync(async (req, res, next) =>{
    const {token} = req.body
    if(!token){
        return next(new AppError("Bad Request", 400))
    }

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
    });

    if (!ticket.getPayload()) {
        return next(new AppError("Bad request", 400))
    }
    const payload = ticket.getPayload();

    let sub = payload.sub
    let email = payload.email

    const emailExist = await User.findOne({email: email})
    if(!emailExist){
        const role = await Role.findOne({ name: "USER" })
        .populate("permissionIds");

        if(!role){
            return next(new AppError("Role not defind", 404))
        }
        const permissions = role.permissionIds.map(p => p.name);
        // user is new user confirmed
        const user = await User.create({sub: payload.sub, picture: payload.picture, given_name: payload.given_name, email:payload.email, username: payload.name, roleId: role._id, permissions })
        if(!user){
            return next(new AppError("Database error",500))
        }
        return res.status(201).json({success: true, message: "User authorized successfully", token : generateAccessTokens(user._id, user.username, user.email, user.roleId)})
    }
    // user is not new user 
    return res.status(200).json({success: true, message: "User authorized successfully", token: generateAccessTokens(emailExist._id, emailExist.username, emailExist.email, emailExist.roleId)})
})


export const googleLogin= catchAsync(async(req, res, next)=>{
        
    const {token} = req.body
    if(!token){
        return next(new AppError("Bad Request", 400))
    }

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
    });
    if (!ticket.getPayload()) {
        return next(new AppError("Authentication failed", 400))
    }
    const payload = ticket.getPayload();

    let email = payload.email

    const emailExist = await User.findOne({email: email})
    if(!emailExist){
        console.log("I am here", payload)
        const role = await Role.findOne({ name: "USER" })
        .populate("permissionIds");

        if(!role){
            return next(new AppError("Roles not found", 404))
        }
        const permissions = role.permissionIds.map(p => p.name);


        // user is new user confirmed
        const user = await User.create({sub: payload.sub, picture: payload.picture, given_name: payload.given_name, email:payload.email, username: payload.name, roleId: role._id, permissions })
        if(!user){
            return next(new AppError("Database error", 500))
        }
        return res.status(201).json({success: true, message: "User authorized successfully", token : generateAccessTokens(user._id, user.username, user.email, user.roleId)})
    }
    return res.status(200).json({success: true, message: "User authorized successfully", token: generateAccessTokens(emailExist._id, emailExist.username, emailExist.email, emailExist.roleId)})
    
})