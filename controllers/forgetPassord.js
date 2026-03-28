import nodemailer from "nodemailer";
import crypto from 'node:crypto';
import ForgetPassword from "../models/forgetPassword.js"
import User from "../models/user.js"
import bcrypt from "bcrypt"
import dotenv from "dotenv"
dotenv.config()

export const forgetPassword = async(req, res)=>{
    try {
        const {email} = req.body
        const verifiedEmail = validateEmail(email)
        if(!verifiedEmail){
            res.status(422).json({success: false, message: "Invalid Email"})
        }
        console.log(1)
        const userAlreadyExist = await User.find({ email: email });
        console.log(userAlreadyExist)
        if(!userAlreadyExist){
            res.status(404).json({success: false, message: "User not found"})
        }
        const id = crypto.randomUUID();
        console.log(id, req.user.userId)
        const response = await ForgetPassword.insertOne({uid: id, userId: req.user.userId, isActive: true})
        console.log(response)
        const msg = await sendEmail(id);
        res.status(200).json({success: true, message: msg})
    } catch (error) {
        res.status(500).json({success: false, message: "Interval sever error, please try after sometime"})        
    }
}




function validateEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}
function validatePassword(password){
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/-]).{8,}$/
    return regex.test(password);
}


async function sendEmail(uuid) {
  const transporter = nodemailer.createTransport({
    host: process.env.AWS_SES_ENDPOINT,
    port: 465, 
    secure: true,
    auth: {
      user: process.env.AWS_SES_SMTP_USERNAME, 
      pass: process.env.AWS_SES_SMTP_PASSWORD, 
    },
  });

  
let htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resumex - Reset Password</title>
    <style>
        body {
        font-family: 'Arial', sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
        color: #333333;
        line-height: 1.6;
        }
        .email-container {
        max-width: 600px;
        margin: 20px auto;
        background: #ffffff;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .email-header {
        background-color: #6c63ff;
        color: #ffffff;
        padding: 20px;
        text-align: center;
        border-radius: 8px 8px 0 0;
        }
        .email-header h1 {
        margin: 0;
        font-size: 24px;
        }
        .email-body {
        padding: 20px;
        }
        .email-body p {
        margin: 10px 0;
        font-size: 16px;
        }
        .reset-button {
        display: inline-block;
        margin: 20px 0;
        padding: 12px 24px;
        background-color: #6c63ff;
        color: #ffffff;
        text-decoration: none;
        font-size: 16px;
        font-weight: bold;
        border-radius: 6px;
        }
        .reset-button:hover {
        background-color: #5446cc;
        }
        .email-footer {
        text-align: center;
        font-size: 14px;
        color: #999999;
        padding: 20px;
        border-top: 1px solid #dddddd;
        }
        .email-footer a {
        color: #6c63ff;
        text-decoration: none;
        }
        .email-footer a:hover {
        text-decoration: underline;
        }
    </style>
    </head>
    <body>
    <div class="email-container">
        <div class="email-header">
        <h1>Reset Your Password</h1>
        </div>
        <div class="email-body">
        <p>Hi,</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <p style="text-align: center;">
            <a href="http://localhost:3000/users/resetpassword/${uuid}" class="reset-button">Reset Password</a>
        </p>
        <p>If you didn’t request this, please ignore this email or contact support if you have concerns.</p>
        <p>Thanks,</p>
        <p>The Resumex Team</p>
        </div>
        <div class="email-footer">
        <p>If you're having trouble clicking the button, copy and paste the link below into your web browser:</p>
        <p><a href="#">Click here</a></p>
        <p>&copy; 2025 Resumex. All rights reserved.</p>
        </div>
    </div>
    </body>
</html>`

  try {
    const info = await transporter.sendMail({
      from: '"MyJobCV Support" <mail@myjobcv.online>',
      to: "anujjaws@gmail.com", 
      subject: "Hello from myjobcv.online! 🚀",
      text: "This is a test email sent via Nodemailer and AWS SES.",
      html: htmlContent,
    });

    console.log("Message sent successfully! Message ID:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}



export const resetPassword = async (req, res) => {
    try {
        const uid = req.params.id
        console.log(uid)
        if(!uid){
            res.status(400).json({success: false, message: "Bad Request"})
        }
        const Fpid = await ForgetPassword.findOne({uid: uid})
        if(!Fpid){
            res.status(404).json({success: false, message: "Id not found"})
        }
        if(Fpid){
            await Fpid.updateOne({isActive: false})
            res.status(200).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Reset Password</title>
                    <style>
                    body {
                        margin: 0;
                        font-family: 'Inter', 'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, sans-serif;
                        background: linear-gradient(145deg, #eef2f7 0%, #dae0ec 100%);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        color: #1e2b3c;
                    }

                    .container {
                        background: white;
                        padding: 2.2rem 2rem 2.5rem 2rem;
                        border-radius: 20px;
                        box-shadow: 0 25px 45px -12px rgba(40, 50, 80, 0.25);
                        max-width: 400px;
                        width: 100%;
                        border: 1px solid rgba(255,255,255,0.5);
                    }

                    .reset-password-form h1 {
                        font-size: 1.9rem;
                        font-weight: 500;
                        margin-bottom: 0.25rem;
                        color: #101d2f;
                        text-align: left;
                        letter-spacing: -0.02em;
                    }

                    .form-subhead {
                        font-size: 0.9rem;
                        color: #59748f;
                        margin-bottom: 2rem;
                        text-align: left;
                        border-left: 3px solid #3266a8;
                        padding-left: 1rem;
                        line-height: 1.5;
                    }

                    /* password policy card */
                    .policy-card {
                        background: #f8fafd;
                        border: 1px solid #e2e9f2;
                        border-radius: 14px;
                        padding: 1.2rem 1.3rem 1rem 1.3rem;
                        margin-bottom: 2rem;
                    }

                    .policy-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 1rem;
                    }

                    .policy-header span:first-child {
                        font-size: 0.75rem;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.4px;
                        color: #3266a8;
                    }

                    .policy-badge {
                        background: #e9eff8;
                        color: #1f3f6e;
                        font-size: 0.7rem;
                        font-weight: 500;
                        padding: 0.2rem 0.8rem;
                        border-radius: 30px;
                    }

                    .policy-grid {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.5rem 0.9rem;
                        margin-bottom: 0.5rem;
                    }

                    .policy-item {
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        background: #ffffff;
                        border: 1px solid #d6e0ec;
                        border-radius: 30px;
                        padding: 0.3rem 1rem 0.3rem 0.8rem;
                        font-size: 0.85rem;
                        color: #1e3f64;
                        font-weight: 450;
                    }

                    .policy-marker {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        background: #edf2f9;
                        border-radius: 50%;
                        width: 22px;
                        height: 22px;
                        font-size: 0.75rem;
                        font-weight: 600;
                        color: #1f3f6e;
                    }

                    .policy-footnote {
                        font-size: 0.7rem;
                        color: #657e99;
                        margin-top: 0.7rem;
                        padding-top: 0.5rem;
                        border-top: 1px dashed #cddae9;
                    }

                    .input-group {
                        margin-bottom: 1.8rem;
                        position: relative;
                    }

                    .input-group label {
                        font-size: 0.85rem;
                        font-weight: 600;
                        color: #1f344b;
                        margin-bottom: 0.4rem;
                        display: block;
                        text-transform: uppercase;
                        letter-spacing: 0.3px;
                    }

                    .input-group input {
                        width: -webkit-fill-available;
                        padding: 0.9rem 2.8rem 0.9rem 1.2rem;
                        border: 1px solid #cbd5e3;
                        border-radius: 14px;
                        font-size: 0.95rem;
                        outline: none;
                        transition: all 0.2s ease;
                        font-family: 'Inter', sans-serif;
                        background: #ffffff;
                    }

                    .input-group input:focus {
                        border-color: #3266a8;
                        box-shadow: 0 0 0 3px rgba(50, 102, 168, 0.1);
                    }

                    .input-group input::placeholder {
                        color: #9fb0c7;
                        font-weight: 300;
                    }

                    .input-group .toggle-password {
                        position: absolute;
                        right: 14px;
                        top: 42px;
                        transform: translateY(-20%);
                        cursor: pointer;
                        font-size: 1.3rem;
                        color: #7e95b0;
                        transition: color 0.2s ease;
                        user-select: none;
                        line-height: 1;
                    }

                    .input-group .toggle-password:hover {
                        color: #3266a8;
                    }

                    button {
                        width: 100%;
                        padding: 1rem;
                        border: none;
                        border-radius: 40px;
                        background: #1d3b5c;
                        color: white;
                        font-size: 1rem;
                        font-weight: 500;
                        cursor: pointer;
                        transition: background 0.2s ease, box-shadow 0.2s;
                        box-shadow: 0 8px 18px -8px #1d3b5c;
                        border: 1px solid #143250;
                        letter-spacing: 0.2px;
                        margin-top: 0.5rem;
                    }

                    button:hover {
                        background: #244b72;
                        box-shadow: 0 12px 22px -10px #1d3b5c;
                    }

                    button:active {
                        background: #132e46;
                        transform: translateY(1px);
                        box-shadow: 0 4px 10px -4px #132e46;
                    }

                    .footer-note {
                        text-align: center;
                        margin-top: 1.5rem;
                        font-size: 0.75rem;
                        color: #7b93af;
                    }
                    </style>
                </head>

                <body>
                    <div class="container" id="container">
                        <form class="reset-password-form" action="/users/updatepassword/${uid}" method="POST">
                            <h1>Set new password</h1>
                            <div class="form-subhead">Must meet company policy requirements</div>

                            <!-- PROFESSIONAL POLICY CARD: 8 char, upper, lower, number, symbol -->
                            <div class="policy-card">
                                <div class="policy-header">
                                    <span>password must contain</span>
                                    <div class="policy-badge">minimum 8 characters</div>
                                </div>
                                <div class="policy-grid">
                                    <div class="policy-item"><span class="policy-marker">8+</span> characters</div>
                                    <div class="policy-item"><span class="policy-marker">A</span> uppercase</div>
                                    <div class="policy-item"><span class="policy-marker">a</span> lowercase</div>
                                    <div class="policy-item"><span class="policy-marker">#1</span> number</div>
                                    <div class="policy-item"><span class="policy-marker">@#!</span> symbol</div>
                                </div>
                                <div class="policy-footnote">
                                    ⚠️ at least 1 uppercase, 1 lowercase, 1 number, 1 special character
                                </div>
                            </div>

                            <div class="input-group">
                                <label for="resetPassword">New Password</label>
                                <input type="password" name="resetPassword" id="resetPassword" placeholder="················" required>
                                <span class="toggle-password" id="togglePassword">👁️</span>
                            </div>

                            <!-- you could add a confirm field, but keeping original structure + policy -->
                            <button id="resetPasswordButton" type="submit">Update password</button>
                            
                            <div class="footer-note">
                                Secure · encrypted transmission
                            </div>
                        </form>
                    </div>

                    <script>
                        (function() {
                            const toggle = document.getElementById('togglePassword');
                            const passwordInput = document.getElementById('resetPassword');
                            
                            if (toggle && passwordInput) {
                                toggle.addEventListener('click', function() {
                                    // toggle type
                                    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                                    passwordInput.setAttribute('type', type);
                                    
                                    // toggle icon (professional: eye open/closed)
                                    this.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
                                });
                            }

                            // optional: add very subtle requirement reminder on submit (but action goes to server)
                            const form = document.querySelector('.reset-password-form');
                            form.addEventListener('submit', function(e) {
                                const pwd = passwordInput.value;
                                // just a gentle reminder — professional, not blocking
                                if (pwd && pwd.length < 8) {
                                    if (!confirm('For security, password should be at least 8 characters. Continue anyway?')) {
                                        e.preventDefault();
                                    }
                                }
                            });
                        })();
                    </script>
                </body>
                </html>
            `)
            res.end()
        }

    } catch (error) {
        console.log(error)
    }
}



export const updatePassword = async(req, res)=>{
    const saltrounds = 10
    const newPassword = req.body.resetPassword
    const isVerified = validatePassword(newPassword)
    console.log(newPassword, isVerified)

    const uuid = req.params.resetpasswordid
    if(!newPassword){
        res.status(400).json({success: false, message: "null new password, try again"})
    }
    if(!isVerified){
        res.status(422).json({success: false, message: "Invalid password format, need aleast 8 characters"})
    }

    if(!uuid){
        res.status(400).json({success: false, message: "Bad Request"})
    }

    const activeUser = await ForgetPassword.findOne({uid: uuid})
    if(!activeUser){
        res.status(404).json({success: false, message: "Id not found, try again"})
    }

    bcrypt.hash(newPassword, saltrounds, async(err, hash)=>{
        if(err){
            throw new Error("Something went wrong")
        }
        const data = await User.findOne({_id: activeUser.userId})
        const updatingPassword = await data.updateOne({password: hash})
        res.status(200).json({success: true, message: "password reset sucessfully"})
    })
}


