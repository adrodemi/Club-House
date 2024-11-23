// script.js
document.getElementById("registrationForm").addEventListener("submit", async function(event) {
  event.preventDefault(); // Prevent form from refreshing the page
  
  const formData = {
      username: document.getElementById("username").value,
      fullName: document.getElementById("fullName").value,
      age: document.getElementById("age").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      location: document.getElementById("location").value,
  };

  try {
      const response = await fetch('http://127.0.0.1:5000/register', {
          method: 'POST'
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
          document.getElementById("message").textContent = result.message;
          document.getElementById("registrationForm").reset();
      } else {
          document.getElementById("message").textContent = result.error;
      }
  } catch (error) {
      document.getElementById("message").textContent = 'An error occurred during registration.';
      console.error(error);
  }
});