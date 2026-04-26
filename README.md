
# 🚀 Resume Builder App


 <p align="center">
  <img src="https://github.com/user-attachments/assets/dd50f2a3-7d9e-4d68-9067-0e0e86997c0e" width="1000" />
</p>



<p align="center">
  <b>Create • Customize • Export — Your Resume in Seconds</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js"/>
  <img src="https://img.shields.io/badge/Express.js-API-black?style=for-the-badge&logo=express"/>
  <img src="https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb"/>
  <img src="https://img.shields.io/badge/Docker-Container-blue?style=for-the-badge&logo=docker"/>
  <img src="https://img.shields.io/badge/AWS-EC2-orange?style=for-the-badge&logo=amazonaws"/>
  <img src="https://img.shields.io/badge/Jenkins-CI/CD-red?style=for-the-badge&logo=jenkins"/>
</p>

---

## ✨ Features

* 🧑‍💼 Build professional resumes with ease
* 🎨 Interactive UI with live editing
* 📄 Export resumes as high-quality PDFs
* 🔐 Secure authentication (JWT + bcrypt)
* ☁️ Cloud storage using AWS S3
* 💳 Integrated payments with Razorpay
* 📧 Email notifications via AWS SES
* 🚦 Rate limiting for API protection

---

## 🧠 Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

### Tools & Integrations

* AWS EC2 (Hosting)
* AWS S3 (Storage)
* AWS SES (Emails)
* Docker (Containerization)
* Docker Hub (Image Registry)
* Jenkins (CI/CD Pipeline)
* Razorpay (Payments)
* Google Auth

---

## 🏗️ Project Structure

```bash
controllers/
middleware/
models/
routes/
public/
views/
utils/
app.js
```

---

## 🚀 Deployment Architecture

This project is deployed using a **modern DevOps pipeline**:

```bash
Code Push → GitHub → Jenkins → Docker Build → Docker Hub → AWS EC2 → Live App
```

### ⚙️ Components

* ☁️ **AWS EC2** → Hosts the application
* 🐳 **Docker** → Runs the app in containers
* 📦 **Docker Hub** → Stores images
* 🔄 **Jenkins** → Automates build & deployment

---

## ⚙️ Getting Started

### 🔧 Installation

```bash
git clone https://github.com/your-username/resume_builder_app.git
cd resume_builder_app
npm install
```

---

### ▶️ Run Locally

```bash
npm run dev
```

App will run on:
👉 http://localhost:3000

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
MONGO_URI=
JWT_TOKEN_SECRET=
PORT=
NODE_ENV=development

AWS_S3_ACCESS_KEY=
AWS_S3_SECRET_KEY=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GOOGLE_RECAPTCHA_CLIENT_ID=
GOOGLE_RECAPTCHA_SECRET_ID=

AWS_SES_SMTP_USERNAME=
AWS_SES_SMTP_PASSWORD=
AWS_SES_ENDPOINT=
```





---

## 💼 Why This Project Stands Out

* Real-world **payment integration (Razorpay)**
* Secure and scalable backend architecture
* Cloud-based file storage (AWS S3)
* CI/CD pipeline using Jenkins
* Dockerized deployment (production-ready)
* Clean MVC structure

---

## 🤝 Contributing

1. Fork the repository
2. Create your branch

   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

## 👨‍💻 Author

**Anuj Kumar**

---

## 📜 License

ISC License

---

<p align="center">
  ⭐ If you like this project, consider giving it a star!
</p>

