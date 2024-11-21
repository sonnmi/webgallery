let HTML = (function () {
  "use strict";

  let htmlModule = {};

  htmlModule.creditsHTML = `
      <h1>Credits</h1>
      <h2>Icons</h2>
      <ul>
        <li>
          left-button.png, right-button.png from
          <a href="https://www.Instagram.com/">Instagram</a> icons
        </li>
        <li>
          All icons were created by me using
          <a href="https://www.figma.com/">Figma</a>
        </li>
      </ul>
      <h2>Ideas & Design</h2>
      <ul>
        <li>
          Linear gradient color from
          <a href="https://uigradients.com/#CanYouFeelTheLoveTonight">
            uiGradients
          </a>
        </li>
        <li>
          Image Display Design Inspiration from
          <a href="https://www.instagram.com/">Instagram</a>
        </li>
        <li>
          Pagination Design Inspiration from
          <a href="https://www.figma.com/">Figma</a> Preview Mode
        </li>
      </ul>
      <h2>HTML, CSS and Javascript code</h2>
      <ul>
        <li>
          Loading animation (css gradient border) from
          <a href="https://codyhouse.co/nuggets/css-gradient-borders">
            codyhouse
          </a>
        </li>
        <li>
          Loading animation idea from
          <a href="https://www.w3schools.com/howto/howto_css_loader.asp">
            W3Schools
          </a>
        </li>
        <li>
          File type checking
          <a href="https://stackoverflow.com/questions/18299806">
            Stackoverflow
          </a>
        </li>
      </ul>
    `;

  htmlModule.loginHTML = `<div class="login-form-container">
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

  return htmlModule;
})();
