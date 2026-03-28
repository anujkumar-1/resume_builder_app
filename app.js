import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// __dirname workaround for ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())

// Routes
import userRoutes from "./routes/userRoutes.js"
import resumeRoutes from "./routes/resumeRoutes.js"


app.use("/users", userRoutes)
app.use("/resume", resumeRoutes)



app.get('/{:page}', (req, res, next) => {
    let page = req.params.page || 'Login'; // default to index
    console.log("first", page)
    let filePath = path.join(__dirname, 'Public', `${page}.html`);

    const validLoginPages = ['Login', 'login'];
    const validSignupPages = ["Signup", "signup"]
  
    if (validLoginPages.includes(page)) {
        // Send admin.html for all valid admin pages
        const pagePath = path.join(__dirname, 'views', 'Login.html');
        return res.sendFile(pagePath);
    } 
    else if(validSignupPages.includes(page)){
        const pagePath = path.join(__dirname, 'views', 'Signup.html');
        return res.sendFile(pagePath);
    }
    else {
        // Handle other pages normally
        const filePath = path.join(__dirname, 'views', `${page}.html`);
        res.sendFile(filePath, (err) => {
            if (err) {
                next(); // Proceed to 404 handler if file not found
            }
        });
    }
});



// MongoDB connection
mongoose.connect("mongodb://localhost:27017/resume", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Example test model import


app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
