let apiService = (function () {
  "use strict";
  let module = {};

  // add a comment to an image
  module.addImage = function (formData) {
    return fetch("/api/images", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: formData,
    }).then((res) => res.json());
  };

  // delete an image from the gallery given its imageId
  module.deleteImage = function (imageId) {
    return fetch(`/api/images/${imageId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }).then((res) => res.json());
  };

  // add a comment to an image
  module.addComment = function (imageId, userId, content) {
    return fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        userId: userId,
        content: content,
        imageId: imageId,
      }),
    }).then((res) => res.json());
  };

  // delete a comment to an image
  module.deleteComment = function (commentId) {
    return fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }).then((res) => res.json());
  };

  // get images
  module.getImages = function (userId, cursor, limit = 1, action = null) {
    if (!action) {
      return fetch(`/api/users/${userId}/images?limit=${limit}`).then((res) =>
        res.json(),
      );
    } else {
      return fetch(
        `/api/users/${userId}/images?limit=${limit}&${action}=${cursor}`,
      ).then((res) => res.json());
    }
  };

  // get comments object: {total: total pages available, comments: a list of 10 comments}
  module.getComments = function (imageId, page = 0, limit = 10) {
    return fetch(
      `/api/images/${imageId}/comments?limit=${limit}&page=${page}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      },
    ).then((res) => res.json());
  };

  // get username and id
  module.getUser = function () {
    return fetch("/api/users/me", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }).then((res) => res.json());
  };

  // get user id for gallery
  module.getGallery = function (cursor, page = 0, action = null, limit = 1) {
    if (!action)
      return fetch(`/api/users?limit=${limit}&page=${page}`).then((res) =>
        res.json(),
      );
    else
      return fetch(`/api/users?limit=${limit}&${action}=${cursor}`).then(
        (res) => res.json(),
      );
  };

  // sign in
  module.signin = function (username, password) {
    return fetch("/api/users/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        return data;
      });
  };

  // sign up
  module.signup = function (username, password) {
    return fetch("/api/users/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (res.status === 409) {
          return { error: "Username already exists" };
        }
        return res.json();
      })
      .then((data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        return data;
      });
  };

  // sign out
  module.signout = function () {
    return fetch("/api/users/signout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }).then((res) => {
      localStorage.removeItem("token");
      return res.json();
    });
  };

  return module;
})();
