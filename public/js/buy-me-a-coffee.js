let API_URL = window.API_CONFIG?.development || "http://localhost:3000"
// DOM elements
const tiers = document.querySelectorAll('.tier');
const customInput = document.getElementById('customAmount');
const supportBtn = document.getElementById('supportBtn');
const messageInput = document.getElementById('coffeeMessage');
const toastEl = document.getElementById('toastMsg');
const toastTextSpan = document.getElementById('toastText');

// Photo upload elements
const photoFileInput = document.getElementById('photoFileInput');
const profileImg = document.getElementById('profilePhoto');
const photoPlaceholderDiv = document.getElementById('photoPlaceholder');
const photoTrigger = document.getElementById('photoUploadTrigger');
const photoNoteTrigger = document.getElementById('photoNoteTrigger');

let currentAmount = 650;   // default ₹650 (matches active tier)

// Helper: format number with commas for Indian numbering (optional but nice)
function formatIndianCurrency(amount) {
    let num = Math.floor(amount);
    let str = num.toString();
    let lastThree = str.slice(-3);
    let otherDigits = str.slice(0, -3);
    if (otherDigits !== '') {
        lastThree = ',' + lastThree;
    }
    let formatted = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return formatted;
}

// Update active tier highlight based on amount (numeric comparison)
function highlightTierByAmount(amount) {
    let matched = false;
    tiers.forEach(tier => {
        // get numeric value from data-value attribute (stored as number)
        const tierVal = parseFloat(tier.getAttribute('data-value'));
        if (!isNaN(tierVal) && tierVal === amount) {
            tier.classList.add('active');
            matched = true;
        } else {
            tier.classList.remove('active');
        }
    });
    if (!matched) {
        tiers.forEach(t => t.classList.remove('active'));
    }
}

// sync custom input field with amount
function syncCustomInput(amount) {
    if (customInput) {
        customInput.value = amount;
    }
    highlightTierByAmount(amount);
    updateButtonAmount(amount);
}

// update button text to show dynamic amount in ₹ with Indian formatting
function updateButtonAmount(amount) {
    if (supportBtn) {
        const amountNumber = parseFloat(amount);
        if (!isNaN(amountNumber)) {
            const formatted = formatIndianCurrency(amountNumber);
            supportBtn.innerHTML = `<span>☕</span> Support with ₹${formatted} <span>→</span>`;
        } else {
            supportBtn.innerHTML = `<span>☕</span> Support with ₹0 <span>→</span>`;
        }
    }
}

// handle tier click
tiers.forEach(tier => {
    tier.addEventListener('click', (e) => {
        const val = parseFloat(tier.getAttribute('data-value'));
        if (!isNaN(val) && val > 0) {
            currentAmount = val;
            syncCustomInput(currentAmount);
            tier.style.transform = 'scale(0.97)';
            setTimeout(() => { if(tier) tier.style.transform = ''; }, 100);
        }
    });
});

customInput.addEventListener('input', () => {
    let val = parseFloat(customInput.value);
    if (!isNaN(val)) {
        currentAmount = val;
        highlightTierByAmount(currentAmount);
        updateButtonAmount(currentAmount);
    }
});


// --- PHOTO UPLOAD LOGIC (adds authenticity) ---
function triggerFileUpload() {
    photoFileInput.click();
}

photoTrigger.addEventListener('click', triggerFileUpload);
photoNoteTrigger.addEventListener('click', triggerFileUpload);

photoFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && (file.type.startsWith('image/'))) {
        const reader = new FileReader();
        reader.onload = function(e) {
            profileImg.src = e.target.result;
            profileImg.style.display = 'block';
            if (photoPlaceholderDiv) photoPlaceholderDiv.style.display = 'none';
            showToast("✓ Photo attached — profile updated! More authentic now.");
            try {
                localStorage.setItem('userProfilePhoto', e.target.result);
            } catch(err) { console.warn("localStorage limit"); }
        };
        reader.readAsDataURL(file);
    } else {
        showToast("Please select a valid image (JPEG, PNG).");
    }
});

// Load previously saved photo from localStorage (optional persistence)
function loadStoredPhoto() {
    const storedPhoto = localStorage.getItem('userProfilePhoto');
    if (storedPhoto) {
        profileImg.src = storedPhoto;
        profileImg.style.display = 'block';
        if (photoPlaceholderDiv) photoPlaceholderDiv.style.display = 'none';
    }
}

// Show toast with professional and friendly message
function showToastMsg(message, isSuccess = true) {
    toastTextSpan.innerText = message;
    toastEl.classList.add('show');
    setTimeout(() => {
        toastEl.classList.remove('show');
    }, 3500);
}

// generate a polished thank you message with authenticity note and INR
function getProfessionalThanks(amount, userMessage, hasPhoto) {
    const formattedAmount = formatIndianCurrency(amount);
    const authenticityNote = hasPhoto ? " (Your support means even more knowing you see the real face behind the work)" : "";
    const templates = [
        `Thank you for your ₹${formattedAmount} contribution. Your support directly fuels ongoing design & development.${authenticityNote}`,
        `Received ₹${formattedAmount}. Grateful for your backing — every coffee helps build better resources.${authenticityNote}`,
        `Appreciation for the ₹${formattedAmount} support! It will be invested in creative tools and open source.${authenticityNote}`,
        `₹${formattedAmount} contribution recorded. Thank you for investing in independent craftsmanship.${authenticityNote}`,
        `Support confirmed: ₹${formattedAmount}. Your encouragement makes a meaningful difference.${authenticityNote}`
    ];
    let baseMsg = templates[Math.floor(Math.random() * templates.length)];
    if (userMessage && userMessage.trim() !== "") {
        let cleanMsg = userMessage.trim().slice(0, 80);
        return `💬 "${cleanMsg}" — ${baseMsg}`;
    }
    return baseMsg;
}

// process support action (simulated)
function processSupport(amount, userMessage) {
    const finalAmount = parseFloat(amount);
    if (isNaN(finalAmount) || finalAmount <= 0) {
        showToast("Please enter a valid amount (₹10 minimum) to continue.");
        return false;
    }
    const hasPhotoUploaded = profileImg.src && profileImg.style.display === 'block' && profileI
    mg.src !== "";
    const thankYouMessage = getProfessionalThanks(finalAmount, userMessage, hasPhotoUploaded);
    if(amount >=10 && amount <=10000){
        showToastMsg(thankYouMessage, true);
    }
    console.log(`[Professional Support] Contribution: ₹${finalAmount}, message: "${userMessage}", photo attached: ${hasPhotoUploaded}`);
    const btn = document.getElementById('supportBtn');
    if (btn) {
        btn.style.transform = 'scale(0.98)';
        setTimeout(() => { if(btn) btn.style.transform = ''; }, 150);
    }
    return true;
}

// main support click event
supportBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let amountValue = parseFloat(customInput.value);
    if (isNaN(amountValue) || amountValue <= 0) {
        amountValue = 50;
        customInput.value = 50;
    }
    currentAmount = amountValue;
    highlightTierByAmount(currentAmount);
    updateButtonAmount(currentAmount);
    const userMsg = messageInput.value;
    processSupport(currentAmount, userMsg);
});

// enter key on message field
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        supportBtn.click();
    }
});

// initialize values
window.addEventListener('DOMContentLoaded', () => {
    if (customInput) customInput.value = "650";
    currentAmount = 650;
    highlightTierByAmount(650);
    updateButtonAmount(650);
    loadStoredPhoto();  // load previously uploaded photo if exists
});


async function buyMeACoffee(){
    const amount = customInput.value
    const userMsg = messageInput.value;

    if(amount > 10000 || amount < 10){
        showToast("Please select an amount between 10 and 9999", false)
        return
    }
    const token=localStorage.getItem("token")
    if(!token){
        showToast("Not authenticated, Please login again")

        setTimeout(()=>{
            window.location.href="./Login"
            return
        }, 3000)
    }

    let obj = {
        amount: amount,
        currency: "INR",
        message: userMsg
    }
    try {
        const response = await axios.post(`${API_URL}/users/create-order`, obj, {headers:{Authorization: token}})
        console.log(response)
        if(response.status===201){
                
            const options = {
                "key": response.data.key_id,
                "order_id": response.data.order.id, 
                "currency": 'INR',
                "name": 'Buy Me A Coffee',
                "amount": response.data.order.amount_due, 
                "image": "https://cdn.vectorstock.com/i/1000v/12/00/buy-me-a-coffee-sticker-vector-34151200.jpg",
                "description": 'Test Transaction',
                "handler": async function (response){
                    const data = await axios.post(`${API_URL}/users/payment-success`,{
                        order_id: response.razorpay_order_id,
                        payment_id: response.razorpay_payment_id

                    }, { headers: { Authorization: token }})
                },
                
                "theme": {
                    "color": '#F37254'
                },
            };

            const rzp = new Razorpay(options);
            rzp.open();
            e.preventDefault();


            rzp1.on("payment.failed", async function(response){
                const reponse = await axios.post(`${API_URL}/users/payment-failed`,{
                        order_id:response.error.metadata.order_id,
                        payment_id:response.error.metadata.payment_id
                    }, { headers: { Authorization: token }})
                showToast("Something went wrong")
            })

        }
            
    } catch (error) {
        
    }


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
    }, 3500); 
}