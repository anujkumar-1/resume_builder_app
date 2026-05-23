import {User} from "../models/index.js";
import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  try {

        const AuthToken = req.headers['authorization']; 
        
        if(!AuthToken){
            return res.status(401).json({ message: "No token provided" });
        }
        const decoded = jwt.verify(AuthToken, process.env.JWT_TOKEN_SECRET);
        let id = decoded.userId
        const user = await User.findById(id);

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
      req.user = user;

      next();
    
  } catch (error) {
    console.error("auth error:", error);
    throw new Error("Auth Error")
  }
};

export default auth;