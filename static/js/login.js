(function () {
  "use strict";

  const loginHTML = `<div class="login-form-container">
        <div class="login-btns">
            <div class="signup login-btn active">Sign Up</div>
            <div class="signin login-btn">Sign In</div>
        </div>
        <form class="login-form">
            <input
                type="text"
                name="username"
                class="form-element"
                placeholder="Enter a username"
                required
            />
            <input
                type="password"
                name="password"
                class="form-element"
                placeholder="Enter a password"
                required
            />
            <button id="login-submit-btn" name="action" class="login-submit-btn">Create an account</button>
        </form>
        <div class="error hidden"></div>`;

  function onError(err) {
    const error = document.querySelector(".error");
    error.innerHTML = err;
    error.classList.remove("hidden");
  }

  const submit = () => {
    if (document.querySelector(".login-form").checkValidity()) {
      const username = document.querySelector("form [name=username]").value;
      const password = document.querySelector("form [name=password]").value;
      let action = document.querySelector("form [name=action]").value;
      if (!action) action = "signup";
      apiService[action](username, password).then(function (res) {
        if (res.error) return onError(res.error);
        window.location.href = "/";
      });
    }
  };

  window.addEventListener("DOMContentLoaded", () => {
    const loginContainer = document.querySelector(".login-container");
    loginContainer.innerHTML = loginHTML;

    const signup = document.querySelector(".signup");
    const signin = document.querySelector(".signin");
    const btn = document.querySelector(".login-submit-btn");
    signup.addEventListener("click", function (e) {
      signup.classList.add("active");
      signin.classList.remove("active");
      btn.innerHTML = "Create an account";
      document.querySelector("form [name=action]").value = "signup";
    });

    signin.addEventListener("click", function (e) {
      signin.classList.add("active");
      signup.classList.remove("active");
      btn.innerHTML = "Login";
      document.querySelector("form [name=action]").value = "signin";
    });

    document
      .querySelector(".login-form")
      .addEventListener("submit", function (e) {
        e.preventDefault();
        submit();
      });
  });
})();
