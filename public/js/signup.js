console.log(window.API_CONFIG)
let API_URL = window.API_CONFIG?.development || "http://localhost:3000"

const googleBtn = document.getElementById("google-btn")
document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Toggle eye icon (simplified for this example)
    this.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
});

function validateEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

function validateName(name){
    const nameRegex = /^[a-zA-Z\s\-À-ÿ]{2,32}$/
    return nameRegex.test(name);
}

function validatePassword(password){
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password)
}


function showToast(message) {
    const container = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        
        setTimeout(() => {
            container.removeChild(toast);
        }, 500);
    }, 1200); 
}


document.getElementById('signupForm').addEventListener('submit',  async function(event) {
        event.preventDefault();

        const name = event.target.name.value
        const email = event.target.email.value
        const password = event.target.password.value
        const verifiedName = validateName(name)
        const verifiedEmail = validateEmail(email)
        const verifiedPassword = validatePassword(password)
        const reToken = grecaptcha.getResponse()


    try {
        // Add your form submission logic here

        if(verifiedName && verifiedEmail && verifiedPassword && reToken){

            showToast("Signing In")

            let obj_info = {
                name:  name,
                email: email,
                password: password,
                recaptcha_token: reToken
            }
            const data = await axios.post(`${API_URL}/users/signup`, obj_info)
            if(data.status===201){
                alert("Signup successful, please login")
                window.location.href= "./Login"
            }
            else{
                throw new Error("Failed to login")
            }
            
        }
        else{

            if(!verifiedPassword && !verifiedEmail && !verifiedName){
                showToast("Incorrect name email password format")
            }
            else if(!verifiedPassword && !verifiedName){
                showToast("Incorrect name password format")
            }
            else if(!verifiedPassword && !verifiedEmail){
                showToast("Incorrect email password format")
            }
            else if(!verifiedEmail && !verifiedName){
                showToast("Incorrect name email format")
            }
            else if(!verifiedPassword){
                showToast("Incorrect password format")
            }
            else if(!verifiedEmail){
                showToast("Incorrect email format")
            }
            else if(!verifiedName){
                showToast("Incorrect name format")
            }
            else{
                showToast("Captcha Invalid")

            }

        }
    } catch (error) {
        console.log("signup html :", error)
    }

    

    
});


let client;

async function handleCredentialResponse(response) {
    let obj ={
        token: response.credential
    }

    console.log("Encoded JWT ID token: " + response.credential);
    const data = await axios.post(`${API_URL}/users/google-signup`, obj)
    if(data.status == 201){
        // new user
        localStorage.setItem("token", data.data.token)
    }
    console.log(data)
    window.location.href="./Resume"
}

window.onload = function () {
    console.log("Initializing Google Client...");
    
    google.accounts.id.initialize({
        client_id: "705879663867-jgtd74t2fe4dn192nlvkjmetaldrd6b6.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });

    google.accounts.id.renderButton(
        document.getElementById("google-btn"),
        { theme: "outline", size: "large" }
    );
};
