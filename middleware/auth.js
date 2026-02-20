import User from "../models/user.js"
import jwt from "jsonwebtoken"

const auth = async (req, res, next)=>{
    try {
        const Authtoken = req.header("Authorization")
        if(Authtoken){
            const token = Authtoken.split(' ')[1]; // Extract token after "Bearer "
            const user= jwt.verify(Authtoken, process.env.JWT_TOKEN_SECRET, (err, user)=>{
                if(err){
                    return res.sendStatus(403); // Invalid token

                }
                req.user = user;
                next();
            }) 
        }
        
    } catch (error) {
        console.error("auth :", error)
        res.status(500).json({message: "internal server error in auth"})
    }
}
export default auth;