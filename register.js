// Registration Form Submission
document.getElementById('registrationForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const phone = document.getElementById('phone').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!phone || !username || !password) {
        alert('Please fill out all fields.');
        return;
    }
    
    alert(`Welcome, ${username}! Registration successful.`);
    // Redirect to the main app page (index.html)
    window.location.href = 'index.html';
});

// Sign-In Form Submission
document.getElementById('signinForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!username || !password) {
        alert('Please fill out all fields.');
        return;
    }
    
    alert(`Welcome back, ${username}! Sign-in successful.`);
    // Redirect to the main app page (index.html)
    window.location.href = 'index.html';
});
