document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("container");
  const registerBtn = document.getElementById("register");
  const loginBtn = document.getElementById("login");

  registerBtn.addEventListener("click", () => {
    container.classList.add("active");
  });

  loginBtn.addEventListener("click", () => {
    container.classList.remove("active");
  });

  const signInButton = document.querySelector('.sign-in button[type="button"]');
  if (signInButton) {
    signInButton.addEventListener("click", verifyAndLogIn);
  }

  function verifyAndLogIn() {
    const usnInput = document.getElementById("usn");
    const passwordInput = document.getElementById("password");

    if (!usnInput || !passwordInput) {
      alert("Login form elements not found.");
      return;
    }

    const usn = usnInput.value;
    const password = passwordInput.value;

    if (!usn || !password) {
      alert("Please fill in all fields");
      return;
    }

    alert("Login successful!");
    window.location.href = 'events.html';
  }
});
