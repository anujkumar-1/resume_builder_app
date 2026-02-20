grecaptcha.ready(function() {
    grecaptcha.execute('YOUR_SITE_KEY', {action: 'submit'}).then(function(token) {
        // Send this token to your Node.js backend
        sendDataToBackend(token);
    });
});

async function sendDataToBackend(captchaToken) {
    const response = await fetch('/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captchaToken })
    });
    const result = await response.json();
    alert(result.success ? "Verified!" : "Bot detected!");
}