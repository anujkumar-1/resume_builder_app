const googleBtn = document.getElementById("google-btn")
let API_URL = window.API_CONFIG?.development || "http://localhost:3000"


document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Toggle eye icon
    this.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
});

function validateEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
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
    }, 3000); 
}

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = e.target.email.value
    const password = e.target.password.value
    const verifiedEmail = validateEmail(email)
    const verifiedPassword = validatePassword(password)
    const reToken = grecaptcha.getResponse()

    try {


        if(verifiedEmail && verifiedPassword && reToken) {

            let loginObj = {
                email: email,
                password: password,
                captchaToken: reToken
            }

            const response = await axios.post(`${API_URL}/users/login`, loginObj)
            if(response.status===200){
                showToast("Logging In")
                localStorage.setItem("token", response.data.token)
                window.location.href= "./Resume"
            }
            

        }
        else{
            if(!verifiedPassword && !verifiedEmail){
                showToast("Incorrect email password format")
            }
            else if(!verifiedPassword){
                showToast("Incorrect password format")
            }
            else if(!verifiedEmail){
                showToast("Incorrect email format")
            }
            else{
                showToast("Captcha Invalid")
            }

        }

    } catch (error) {
        if(error.response.status === 401){
            showToast("incorrect password, if forget password try loggin in with google")
        }
        else{
            showToast(`${error.response.status}, ${error.response.data.message}`)
        }
    }
    
});




let client;

async function handleCredentialResponse(response) {
    let obj ={
        token: response.credential
    }
    console.log("Encoded JWT ID token: " + response.credential);
    const data = await axios.post(`${API_URL}/users/google-login`, obj)
    if(data.status == 201){
        // new user
        localStorage.setItem("token", data.data.token)
    }
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
