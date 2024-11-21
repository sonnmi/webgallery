(function () {
  "use strict";

  const state = {
    image: null,
    currentGalleryUserId: null,
    currentGalleryUsername: null,
    currentImageKey: null,
    totalImageCount: null,
    comments: null,
    currentCommentPageIndex: 1,
    totalCommentPageCount: 0,
    currentBrowsePageIndex: 1,
    totalBrowsePageCount: 0,
    status: false,
  };

  const creditsHTML = `
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

  function onError(err) {
    const error = document.querySelector(".error");
    error.innerHTML = err;
    error.classList.remove("hidden");
  }

  const deleteImage = (imageId) => {
    if (state.image) {
      apiService.deleteImage(imageId).then((res) => {
        if (!res.error) {
          // showLoader();
          if (state.currentImageKey < state.totalImageCount - 1) {
            updateImage(1, imageId, "next");
          } else if (state.currentImageKey > 1) {
            updateImage(1, imageId, "prev");
          } else {
            updateImage(1, imageId);
          }
        }
      });
    }
  };

  const deleteComment = (commentId) => {
    if (state.comments.length === 1 && state.currentCommentPageIndex > 1) {
      state.currentCommentPageIndex -= 1;
    }
    apiService.deleteComment(commentId).then(() => {
      // showLoader();
      updateComments();
    });
  };

  const signOut = () => {
    apiService.signout().then(() => {
      updateStatus(false);
      state.currentGalleryUserId = null;
      state.currentGalleryUsername = null;
      updateImage(1, 0);
    });
  };

  const signIn = () => {
    document.querySelector(".login-container").classList.remove("hidden");
    document.querySelector(".credits-container").classList.add("hidden");
    document.querySelector(".browse-btn").classList.add("hidden");
    document.querySelector(".login").classList.add("hidden");
    document.querySelector(".gallery-container").classList.add("hidden");
    document.querySelector(".credits").classList.add("hidden");
  };

  const createCommentComponent = (comment, imageOwner, username) => {
    const elmt = document.createElement("div");
    elmt.className = "comment row";
    elmt.innerHTML = `<div class="profile-icon col-1 col-sm-1">
                          <img src="media/comment-icon.png" width="27" height="24" />
                      </div>
                      <div class="comment-details col-auto col-sm-auto">
                          <div class="comment-details-content">
                              <div class="comment-author">${comment.User.username}</div>
                              <div class="comment-content">
                                  <p>${comment.content}</p>
                              </div>
                          </div>
                          <div class="comment-details-date">${new Date(comment.createdAt).toLocaleDateString()}</div>
                      </div>
                    `;
    if (username) {
      if (
        state.status &&
        (username === comment.User.username || username === imageOwner)
      ) {
        elmt.innerHTML +=
          '<div class="col-1 delete-icon col-sm-3 fade-animation"></div>';
        elmt.querySelector(".delete-icon").onclick = () =>
          deleteComment(comment.id);
      }
    }
    return elmt;
  };

  const updateImage = (limit, cursor, action = null, userId = null) => {
    apiService
      .getImages(state.currentGalleryUserId, cursor, limit, action)
      .then(function (response) {
        if (response.error) return onError(response.error);
        // showLoader();
        if (!state.currentGalleryUserId)
          document.querySelector(".gallery-owner").innerHTML = "";
        document.querySelector(".image .image-picture").src = "";
        if (response.image) {
          state.image = response.image;
          state.currentImageKey = response.current;
          state.totalImageCount = response.count;
          const currentImage = state.image;
          state.currentGalleryUserId = currentImage.UserId;
          state.currentGalleryUsername = currentImage["User.username"];
          if (
            state.status &&
            userId === currentImage.UserId &&
            userId &&
            currentImage["User.username"]
          ) {
            document.querySelector(".gallery-owner").innerHTML = "Your Gallery";
          } else {
            document.querySelector(".gallery-owner").innerHTML =
              `${currentImage["User.username"]}'s Gallery`;
          }
          document.querySelector(".image").style.background =
            `url() linear-gradient(to right, rgba(69,104,220,0.55), rgba(176,106,179,0.55)) no-repeat`;
          document.querySelector(".image .image-picture").src =
            `/api/images/${state.image.id}`;
          document.querySelector(".delete-image-btn").onclick = () =>
            deleteImage(currentImage.id);
          document.querySelector(
            ".image-display-container .slide-current",
          ).innerHTML = `${state.currentImageKey}`;
          document.querySelector(
            ".image-display-container .slide-total",
          ).innerHTML = `${state.totalImageCount}`;
          document.querySelector(".image-info .image-info-title").innerHTML =
            `${currentImage.title}`;
          document.querySelector(".image-info .image-info-author").innerHTML =
            `By ${currentImage["User.username"]}`;

          state.currentCommentPageIndex = 1;
          updateComments();
          document.querySelector(".no-image").classList.add("hidden");
          document
            .querySelector(".image-content-container")
            .classList.remove("hidden");

          updateImageSlideButton();
          updateCommentSlideButton();
        } else {
          hideLoader();
          state.image = null;
          state.currentImageKey = null;
          state.totalImageCount = null;
          document
            .querySelector(".image-content-container")
            .classList.add("hidden");
          document.querySelector(".no-image").classList.remove("hidden");
        }

        updateGallery(userId);
        if (state.status) {
          apiService.getUser().then((res) => {
            let userId = res.UserId;
            checkUserGallery(userId, state.currentGalleryUsername);
            updateGallery(userId);
          });
        }
      });
  };

  const updateLoader = () => {
    if (!state.status || (state.image && state.comments !== null)) {
      hideLoader();
      document.querySelector(".image").style.background =
        `linear-gradient(to right, rgba(69,104,220,0.55), rgba(176,106,179,0.55)) no-repeat`;
    }
  };

  const checkUserGallery = (userId, galleryOwnerName) => {
    if (
      state.status &&
      userId === state.currentGalleryUserId &&
      userId &&
      state.currentGalleryUserId
    ) {
      document.querySelector(".gallery-owner").innerHTML = "Your Gallery";
    } else {
      document.querySelector(".gallery-owner").innerHTML =
        `${galleryOwnerName}'s Gallery`;
    }
  };

  const getGalleryList = () => {
    apiService
      .getGallery(0, state.currentBrowsePageIndex, null, 6)
      .then((res) => {
        state.totalBrowsePageCount = res.totalPage;
        document.querySelector(".browse-container .slide-current").innerHTML =
          `${state.currentBrowsePageIndex}`;
        document.querySelector(".browse-container .slide-total").innerHTML =
          `${res.totalPage}`;
        document
          .querySelector(".browse-container .slide-container")
          .classList.remove("hidden");
        const galleries = document.querySelector(".browse-gallery");
        galleries.innerHTML = "";
        if (res.users.length > 0) {
          apiService.getUser().then((response) => {
            res.users.forEach(function (user) {
              const elmt = document.createElement("div");
              elmt.className = "gallery-item";
              elmt.innerHTML = `${user.username}'s Gallery`;
              galleries.appendChild(elmt);

              elmt.onclick = () => {
                state.currentGalleryUserId = user.id;
                state.currentGalleryUsername = user.username;
                checkUserGallery(response.UserId, user.username);
                updateImage(1, user.id, null, response.UserId);
              };
            });
          });
        } else {
          document
            .querySelector(".browse-container .slide-container")
            .classList.add("hidden");
        }
      });
  };

  const showLoader = () => {
    document.querySelector(".loader").classList.remove("hidden");
    const loads = document.querySelectorAll(".load");
    loads.forEach((elem) => {
      elem.classList.add("hidden");
    });
  };

  const hideLoader = () => {
    document.querySelector(".loader").classList.add("hidden");
    document.querySelector(".main-content").classList.remove("hidden");
    const loads = document.querySelectorAll(".load");
    loads.forEach((elem) => {
      elem.classList.remove("hidden");
    });
  };

  const updateLogin = () => {
    if (state.status) {
      document.querySelector(".comments-container").classList.remove("hidden");
      document.querySelector(".comment-form").classList.remove("hidden");
      document.querySelector(".no-display-comments").classList.add("hidden");
      document.querySelector(".login").innerHTML = "Sign Out";
      document.querySelector(".login").onclick = () => signOut();
    } else {
      document.querySelector(".comments-container").classList.add("hidden");
      document.querySelector(".comment-form").classList.add("hidden");
      document.querySelector(".no-display-comments").classList.remove("hidden");
      document.querySelector(".login").innerHTML = "Sign In";
      document.querySelector(".login").onclick = () => signIn();
    }
  };

  const updateGallery = (userId = null, data = null) => {
    if (data) {
      state.currentGalleryUserId = data.users.id;
      state.currentGalleryUsername = data.users.username;
    }
    if (state.status && state.currentGalleryUserId === userId && userId) {
      document.querySelector(".control-image-btns").classList.remove("hidden");
      document.querySelector(".delete-image-btn").classList.remove("hidden");
      document.querySelector(".add-image-btn").classList.remove("hidden");
      if (state.image) {
        document.querySelector(".delete-image-btn").classList.remove("hidden");
      } else {
        document.querySelector(".delete-image-btn").classList.add("hidden");
      }
    } else {
      document.querySelector(".delete-image-btn").classList.add("hidden");
      document.querySelector(".add-image-btn").classList.add("hidden");
    }
  };

  const updateStatus = (status) => {
    state.status = status;
    updateLogin();
  };

  const updateComments = () => {
    if (state.image) {
      apiService
        .getComments(state.image.id, state.currentCommentPageIndex)
        .then((response) => {
          if (response.error) {
            updateStatus(false);
          } else {
            state.comments = response.comments;
            state.totalCommentPageCount = response.totalPage;
            document.querySelector(".comments").innerHTML = "";
            if (state.comments.length > 0) {
              let username = null;
              if (state.status) {
                apiService.getUser().then((res) => {
                  if (res.username) {
                    username = res.username;
                  }
                  state.comments.forEach(function (comment) {
                    const newComment = createCommentComponent(
                      comment,
                      state.image["User.username"],
                      username,
                    );
                    document.querySelector(".comments").appendChild(newComment);
                  });
                  document.querySelector(
                    ".comments-display-container .slide-current",
                  ).innerHTML = `${state.currentCommentPageIndex}`;
                  document.querySelector(
                    ".comments-display-container .slide-total",
                  ).innerHTML = `${state.totalCommentPageCount}`;
                  document
                    .querySelector(".slide-container-wrap")
                    .classList.remove("hidden");
                  updateCommentSlideButton();
                });
              }
            } else {
              document
                .querySelector(".slide-container-wrap")
                .classList.add("hidden");
            }
          }
        })
        .then(() => updateLoader());
    }
  };

  const getUserGallery = () => {
    apiService.getUser().then((res) => {
      if (res.UserId) {
        state.currentGalleryUserId = res.UserId;
        state.currentGalleryUsername = res.username;
      }
      updateGallery(res.UserId);
      updateImage(1, res.UserId, null, res.UserId);
    });
  };

  const updateImageSlideButton = () => {
    const imageNextBtn = document.querySelector(
      ".image-display-container .slide-right-btn",
    );
    const imagePrevBtn = document.querySelector(
      ".image-display-container .slide-left-btn",
    );
    if (state.currentImageKey === state.totalImageCount) {
      imageNextBtn.classList.add("blur");
    } else {
      imageNextBtn.classList.remove("blur");
    }
    if (state.currentImageKey === 1) {
      imagePrevBtn.classList.add("blur");
    } else {
      imagePrevBtn.classList.remove("blur");
    }
  };

  const updateCommentSlideButton = () => {
    const commentNextBtn = document.querySelector(
      ".comments-display-container .slide-right-btn",
    );
    const commentPrevBtn = document.querySelector(
      ".comments-display-container .slide-left-btn",
    );
    if (state.currentCommentPageIndex === state.totalCommentPageCount) {
      commentNextBtn.classList.add("blur");
    } else {
      commentNextBtn.classList.remove("blur");
    }
    if (state.currentCommentPageIndex === 1) {
      commentPrevBtn.classList.add("blur");
    } else {
      commentPrevBtn.classList.remove("blur");
    }
  };

  window.onload = function () {
    getGalleryList();
    apiService.getUser().then((res) => {
      if (res.username) {
        updateStatus(true);
        state.currentGalleryUserId = res.UserId;
        state.currentGalleryUsername = res.username;
        getUserGallery();
        document.querySelector(".gallery-owner").innerHTML = "Your Gallery";
      } else {
        updateStatus(false);
        updateGallery(res.UserId);
        updateImage(1, 0);
      }
    });

    // click events
    document.addEventListener("click", (e) => {
      const btn = document.querySelector(".add-image-btn");
      const imageForm = document.querySelector(".add-image-form");
      const galleryContainer = document.querySelector(".gallery-container");
      if (!btn.contains(e.target)) {
        if (!imageForm.contains(e.target)) {
          imageForm.classList.add("hidden");
          galleryContainer.classList.remove("blur");
        }
      } else {
        if (Array.from(imageForm.classList).includes("hidden")) {
          imageForm.classList.remove("hidden");
          galleryContainer.classList.add("blur");
        } else {
          imageForm.classList.add("hidden");
          galleryContainer.classList.remove("blur");
        }
      }

      const imageNextBtn = document.querySelector(
        ".image-display-container .slide-right-btn",
      );
      const imagePrevBtn = document.querySelector(
        ".image-display-container .slide-left-btn",
      );
      if (imageNextBtn.contains(e.target)) {
        if (state.currentImageKey < state.totalImageCount) {
          // showLoader();
          updateImage(1, state.image.id, "next");
        }
      } else if (imagePrevBtn.contains(e.target)) {
        if (state.currentImageKey > 1) {
          // showLoader();
          updateImage(1, state.image.id, "prev");
        }
      }

      // comment navigation
      const commentNextBtn = document.querySelector(
        ".comments-display-container .slide-right-btn",
      );
      const commentPrevBtn = document.querySelector(
        ".comments-display-container .slide-left-btn",
      );
      if (commentNextBtn.contains(e.target)) {
        if (state.currentCommentPageIndex < state.totalCommentPageCount) {
          state.currentCommentPageIndex += 1;
          // showLoader();
          updateComments();
        }
      } else if (commentPrevBtn.contains(e.target)) {
        if (state.currentCommentPageIndex > 1) {
          state.currentCommentPageIndex -= 1;
          // showLoader();
          updateComments();
        }
      }

      // browse gallery navigation
      const browseBtn = document.querySelector(".browse-btn");
      const browseCloseBtn = document.querySelector(".browse-close-btn");
      const browseContainer = document.querySelector(".browse-container");
      if (browseBtn.contains(e.target)) {
        browseContainer.classList.remove("hidden");
        document.querySelector(".gallery-container").classList.add("blur-dark");
        document.querySelector(".header-container").classList.add("blur-dark");
      }
      if (browseCloseBtn.contains(e.target)) {
        browseContainer.classList.add("hidden");
        document
          .querySelector(".gallery-container")
          .classList.remove("blur-dark");
        document
          .querySelector(".header-container")
          .classList.remove("blur-dark");
      }
      const browseNextBtn = browseContainer.querySelector(".slide-right-btn");
      const browsePrevBtn = browseContainer.querySelector(".slide-left-btn");
      if (browseNextBtn.contains(e.target)) {
        if (state.currentBrowsePageIndex < state.totalBrowsePageCount) {
          state.currentBrowsePageIndex += 1;
          // //showLoader();
          if (state.currentBrowsePageIndex === state.totalBrowsePageCount) {
            browseNextBtn.classList.add("blur");
            browsePrevBtn.classList.remove("blur");
          } else {
            browseNextBtn.classList.remove("blur");
            if (state.currentBrowsePageIndex !== 1) {
              browsePrevBtn.classList.remove("blur");
            }
          }
          getGalleryList();
        }
      } else if (browsePrevBtn.contains(e.target)) {
        if (state.currentBrowsePageIndex > 1) {
          state.currentBrowsePageIndex -= 1;
          if (state.currentBrowsePageIndex === 1) {
            browsePrevBtn.classList.add("blur");
            browseNextBtn.classList.remove("blur");
          } else {
            browsePrevBtn.classList.remove("blur");
            if (state.currentBrowsePageIndex !== state.totalBrowsePageCount) {
              browseNextBtn.classList.remove("blur");
            }
          }
          getGalleryList();
        }
      }
    });

    // SPA navigation
    const credits = document.querySelector(".credits");
    const logo = document.querySelector(".logo");
    const creditsContainer = document.querySelector(".credits-container");
    const loginContainer = document.querySelector(".login-container");
    const galleryContainer = document.querySelector(".gallery-container");
    creditsContainer.innerHTML = creditsHTML;

    logo.addEventListener("click", function (e) {
      creditsContainer.classList.add("hidden");
      galleryContainer.classList.remove("hidden");
      loginContainer.classList.add("hidden");
      credits.classList.remove("hidden");
      document.querySelector(".browse-btn").classList.remove("hidden");
      document.querySelector(".login").classList.remove("hidden");
      getUserGallery();
    });

    credits.addEventListener("click", function (e) {
      creditsContainer.classList.remove("hidden");
      galleryContainer.classList.add("hidden");
      loginContainer.classList.add("hidden");
      credits.classList.add("hidden");
    });

    // check file type on upload
    const allowedExtension = ["jpeg", "jpg", "png", "gif", "bmp"];
    const externsionWarning = document.createElement("div");
    let control = document.querySelector("#image-picture");
    let imageForm = document.querySelector(".add-image-form");
    control.addEventListener(
      "change",
      () => {
        const file = Array.from(control.files)[0];
        if (!allowedExtension.includes(file.type.split("/")[1])) {
          control.value = "";
          externsionWarning.className = "extension-warning";
          externsionWarning.innerHTML = `Please upload an image. (${allowedExtension.join(", ")})`;
          imageForm.insertBefore(
            externsionWarning,
            document.querySelector(".add-image"),
          );
        } else {
          if (imageForm.querySelector(".extension-warning")) {
            imageForm.removeChild(externsionWarning);
          }
        }
      },
      false,
    );

    // submit an image event with authentication
    document
      .querySelector("#add-image-form")
      .addEventListener("submit", function (e) {
        e.preventDefault();
        if (state.status) {
          const formData = new FormData(e.target);
          apiService.getUser().then((res) => {
            formData.append("author", res.UserId);
            apiService.addImage(formData).then(() => {
              state.currentCommentPageIndex = 1;
              // showLoader();
              updateImage(1, res.UserId);
              document.querySelector(".add-image-form").classList.add("hidden");
              document
                .querySelector(".gallery-container")
                .classList.remove("blur");
            });
          });
        } else {
          onError("Please sign in to upload an image.");
        }
        e.target.reset();
      });

    // submit a comment event
    document
      .querySelector("#create-comment-form")
      .addEventListener("submit", function (e) {
        e.preventDefault();
        if (state.status) {
          const formData = new FormData(e.target);
          const formProps = Object.fromEntries(formData);
          apiService.getUser().then((res) => {
            apiService
              .addComment(state.image.id, res.UserId, formProps.content)
              .then(() => {
                state.currentCommentPageIndex = 1;
                // showLoader();
                updateComments();
              });
          });
        }
        e.target.reset();
      });
  };
})();
