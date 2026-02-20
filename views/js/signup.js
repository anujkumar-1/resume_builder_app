document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Toggle eye icon (simplified for this example)
    this.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
});

document.getElementById('signupForm').addEventListener('submit',  async function(event) {

    try {
        event.preventDefault();
        // Add your form submission logic here

        const name = event.target.name.value
        const email = event.target.email.value
        const password = event.target.password.value

        let obj_info = {
            name:  name,
            email: email,
            password: password
        }

        const data = await axios.post(`http://localhost:3000/users/signup`, obj_info)
        if(data.status===201){
            alert("Signup successful, please login")
            window.location.href= "./Login.html"
        }
        else{
            throw new Error("Failed to login")
        }
        
    } catch (error) {
        console.log("signup html :", error)
    }

    

    
});