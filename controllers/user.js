import {User, Role, Contributions} from "../models/index.js"
import {catchAsync} from "../utils/catchAsync.js"
import AppError from "../utils/appError.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import Razorpay from "razorpay";
import axios from 'axios';
import dotenv from "dotenv"
import crypto from 'crypto'
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


export function generateAccessTokens(id, name, email, roleId){
    const token = jwt.sign({userId: id, name:name, email, roleId: roleId}, process.env.JWT_TOKEN_SECRET, { expiresIn: "15d" })
    return token
}

export const signUp = catchAsync(async (req, res, next) => {
    const { recaptcha_token, name, email, password } = req.body;
    const saltRounds = 10;

    // 1. Validation Checks (Use 'return next(new ...)')
    if (!recaptcha_token || !name || !email || !password) {
        return next(new AppError("Bad Request, missing fields", 400));
    }

    const verifiedEmail = validateEmail(email);
    const verifiedPassword = validatePassword(password);
    
    if (!verifiedEmail || !verifiedPassword) {
        return next(new AppError("Bad Request, incorrect email or password format", 400));
    }

    const result = await verifyToken(recaptcha_token);
    if (!result.verified) {
        return next(new AppError("Bad Request, incorrect captcha token", 400));
    }

    // 2. Check for Existing User
    const userAlreadyExist = await User.findOne({ email: email });
    if (userAlreadyExist) { // findOne returns an object or null
        return next(new AppError("User Already Exists", 409));
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Role Logic
    const role = await Role.findOne({ name: "USER" }).populate("permissionIds");

    if (!role) {
        // Send a 500 because this is a database setup issue
        return next(new AppError("Role 'USER' not found in database", 500));
    }

    const permissions = role.permissionIds.map(p => p.name);

    // 4. Create User
    const user = await User.create({
        username: name,
        email,
        roleId: role._id,
        permissions,
        password: hashedPassword
    });

    return res.status(201).json({
        success: true,
        message: "User signed up successfully",
        userId: user._id
    });
});



export const login = catchAsync(async (req, res, next)=>{
        const {email, password, captchaToken} = req.body
        if(!email || !password || !captchaToken){
            return next(new AppError("Bad Request, Missing email or password or captcha", 400));
        }
        console.log(email, password, captchaToken)
        const verifiedEmail = validateEmail(email)
        const verifiedPassword = validatePassword(password)
        
        if(!verifiedEmail || !verifiedPassword){
            return next(new AppError("Bad Request, Incorrect email or password format", 400));
        }
        const user = await User.findOne({ email }).select('password username email roleId').lean()
        if(!user){
            return next(new AppError("Invalid email or password", 400)); 
        }

      const isMatch = await bcrypt.compare(password, user.password);
    // 2. Handle the result
        if (!isMatch) {
            return next(new AppError("Invalid email or password", 401));
        }
            
        const token = generateAccessTokens(user._id, user.username, user.email, user.roleId);
    
        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            token
        });  
})

export const authenticate = catchAsync(async (req, res, next)=>{
    const userAlreadyExist = await User.findById({ _id:req.user._id });
    if(!userAlreadyExist){
        return next(new AppError("User Not Found", 404)); 
    }
    return res.status(200).json({success: true, message: "Authentication Successful"})
})

function validateAmount(amount){
  return typeof amount === 'number' && 
         !isNaN(amount) && 
         amount >= 10 && 
         amount <= 10000;
}

export const createOrder = catchAsync(async(req, res, next)=>{

    let {amount , currency, message} = req.body
    const idempotencyKey = req.headers['idempotency-key'];
    console.log(idempotencyKey,amount, currency )
    if(!amount || !currency || !idempotencyKey){
        return next(new AppError("Bad Request, Missing amount or currency or key", 400)); 
    }
    let isValid = validateAmount(amount)
    console.log(amount)
    if(!isValid){
        return next(new AppError("Bad request, Amount not correct", 400));         
    }

    // check idempotentkey
    const existingOrder = await Contributions.findOne({idempotent_key:idempotencyKey, user: req.user._id})
    console.log(amount)

    if(existingOrder){
        console.log("Inside",amount)

        const orderValid = orderCheck(existingOrder, amount)
        if(orderValid.isPaid){
            return res.status(200).json({success: true, message: "already paid"})
        }
        if(orderValid.isValid){
            // no need to create new order just return 
            return res.status(200).json({
                key_id: process.env.RAZORPAY_KEY_ID,
                order: {
                    id: existingOrder.order_id, 
                    amount_due: existingOrder.amount
                }
            });
        }
    }
    console.log(amount)


    var rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });


    const razorpayOptions = {
        amount: amount * 100, // paise
        currency: "INR",
        receipt: idempotencyKey // Using key as receipt is good practice
    };

    // Await the promise instead of using a callback!
    const order = await rzp.orders.create(razorpayOptions);

    if (!order) {
        return next(new AppError("Razorpay order creation failed", 400));
    }
    console.log("Saving to DB:", { order_id: order.id, user: req.user._id });

    await Contributions.create({
        order_id: order.id,
        payment_status: "pending",
        user: req.user._id,
        message: message,
        idempotent_key: idempotencyKey,
        amount: amount
    });

    return res.status(201).json({
        success: true,
        order,
        key_id: process.env.RAZORPAY_KEY_ID
    });
})

export const paymentSuccess = catchAsync(async (req, res, next) => {
    const { order_id, payment_id, razorpay_signature } = req.body;
    
    console.log("Processing Success:", order_id, payment_id);

    if (!order_id || !payment_id || !razorpay_signature) {
        return next(new AppError("Bad Request, Missing order_id or payment_id", 400));
    }

    const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(order_id + "|" + payment_id)
        .digest('hex');


    if (generated_signature !== razorpay_signature) {
        return next(new AppError("Payment verification failed! Invalid Signature.", 400));
    }

    const updatedContribution = await Contributions.findOneAndUpdate(
        { order_id: order_id },
        {
            $set: {
                payment_id: payment_id,
                payment_status: "success"
            }
        },
        { new: true, runValidators: true } 
    );

    if (!updatedContribution) {
        return next(new AppError("Order not found in database", 404));
    }

    return res.status(200).json({
        success: true, 
        message: "Payment recorded successfully",
        data: updatedContribution
    });
});


export const paymentFailed = catchAsync(async (req, res, next) => {
    const { order_id, payment_id } = req.body;

    console.log("Processing Failure:", order_id, payment_id);

    if (!order_id) {
        return next(new AppError("Order ID is required to record failure", 400));
    }

    const updatedContribution = await Contributions.findOneAndUpdate(
        { order_id: order_id },
        {
            $set: {
                payment_id: payment_id || "N/A",
                payment_status: "failed"
            }
        },
        { new: true }
    );

    // 2. Check if the record exists
    if (!updatedContribution) {
        return next(new AppError("Order record not found", 404));
    }

    return res.status(200).json({
        success: true,
        message: "Failure recorded for analytics",
        data: updatedContribution
    });
});


function validateEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}


function validatePassword(password){
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password)
}
    
function orderCheck(order, newAmount){
    // this function will check order status and match order amount with new amount if any condition fails return false is valid return true 
    const orderStatus = order.payment_status
    const orderAmount = order.amount
    const orderValid  = checkOrderValidity(order.createdAt)
    const amountMatch = amountCheck(orderAmount, newAmount)

    if(orderStatus === "success"){
        return { 
            isValid: false, 
            isPaid: true,
            message: "Order is not valid, already expired/paid" 
        };

    }
    if(orderValid && amountMatch){
        return {
            isValid: true,
            isPaid: false
        }
    }
    else{
        const errorMsg = !orderValid ? "Order has expired" : "Amount mismatch";
        return { 
            isValid: false,
            isPaid:false, 
            message: errorMsg
        };
    }
    
}

function checkOrderValidity(createdAt){
    const currentTime = new Date();
    const createdTime = new Date(createdAt)
    const timeDiff = currentTime - createdTime
    const thirtyMinutesInMille = 1800000
    return timeDiff < thirtyMinutesInMille
}

function amountCheck(orderAmount, newAmount){
    return orderAmount == newAmount
}