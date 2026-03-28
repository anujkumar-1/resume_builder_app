let API_URL = window.API_CONFIG?.development || "http://localhost:3000"
const forgetPasswordForm = document.getElementById("forget-password-form")

document.addEventListener("DOMContentLoaded", () => {

    forgetPasswordForm.addEventListener("submit", async (e) => {
        e.preventDefault()
        const email = e.target.email.value
        const verifiedEmail=validateEmail(email)
        console.log(email, verifiedEmail)
        try {
            if(verifiedEmail){
                let obj ={
                    email: email
                }
                let token = localStorage.getItem("token")
                console.log(token)
                showToast(`Sending OTP on ${email}, OTP valid for 15 min`)
                const response = await axios.post(`${API_URL}/users/forgetpassword`, obj, {headers:{Authorization: token}})
                console.log(response)
                if(response.status === 200){
                    window.href="./Login"
                }
            }else{
                showToast(`Invalid email format`)
            }
            
        } catch (error) {
            
        }
        
    })
})



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



function validateEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}
