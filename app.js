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

app.use(express.static(path.join(__dirname, 'views')));

app.use(express.json())
app.use(express.urlencoded({ extended: false })); 


// Routes
import userRoutes from "./routes/userRoutes.js"
import resumeRoutes from "./routes/resumeRoutes.js"

app.use(cors())

app.use("/users", userRoutes)
app.use("/resume", resumeRoutes)




app.use("/resume", (req, res)=>{
  res.sendFile(path.join(__dirname, "views", "Resume.html"))
})



app.use('/', (req, res) => {
    console.log("urlll", req)
  res.sendFile(path.join(__dirname, 'views', 'Signup.html'));
});

console.log(process.env.MONGO_URI)
// MongoDB connection
mongoose.connect("mongodb://host.docker.internal:27017/resume", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Example test model import


app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
