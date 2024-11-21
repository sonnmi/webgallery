import { Router } from "express";
import { User } from "../models/users.js";
import { Image } from "../models/images.js";
import { Token } from "../models/tokens.js";
import { Op } from "sequelize";
import { isAuthenticated } from "../middleware/auth.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

export const usersRouter = Router();

usersRouter.post("/signup", async (req, res) => {
  if (!("username" in req.body && "password" in req.body)) {
    return res.status(422).json({ error: "Missing required field." });
  }
  const user = User.build({
    username: req.body.username,
  });
  const salt = bcrypt.genSaltSync(10);
  user.password = bcrypt.hashSync(req.body.password, salt);
  try {
    await user.save();
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Username is already used." });
    }
    return res.status(422).json({ error: "User creation failed." });
  }
  // token expires after 12 hours
  const token = await Token.create({
    UserId: user.id,
    token: crypto.randomBytes(16).toString("hex"),
    expires: new Date(Date.now() + 43200000),
  });
  return res.json({
    user: user,
    token: token.token,
  });
});

usersRouter.post("/signin", async (req, res) => {
  if (!("username" in req.body && "password" in req.body)) {
    return res.status(422).json({ error: "Missing required fields." });
  }
  const user = await User.findOne({
    where: {
      username: req.body.username,
    },
  });
  if (user === null) {
    return res.status(401).json({ error: "Incorrect username or password." });
  }
  const hash = user.password;
  const password = req.body.password;
  const result = bcrypt.compareSync(password, hash);
  // password incorrect
  if (!result) {
    return res.status(401).json({ error: "Incorrect username or password." });
  }
  // username and password correct
  let token = await Token.findOne({
    where: {
      UserId: user.id,
    },
  });
  if (!token) {
    token = await Token.create({
      UserId: user.id,
      token: crypto.randomBytes(16).toString("hex"),
      expires: new Date(Date.now() + 43200000),
    });
  } else {
    token = await token.update({
      token: crypto.randomBytes(16).toString("hex"),
      expires: new Date(Date.now() + 43200000),
    });
  }
  return res.json({ user: user, token: token.token });
});

usersRouter.post("/signout", isAuthenticated, async (req, res) => {
  const token = await Token.findOne({
    where: {
      token: req.headers.authorization.split("Bearer ")[1],
    },
  });
  if (!token) {
    return res.status(404).json({ error: "User auth does not exist" });
  }
  await token.destroy();
  return res.json({ message: "signed out" });
});

usersRouter.get("/me", async (req, res) => {
  // returns the user's info from the database
  try {
    const token = await Token.findOne({
      where: {
        token: req.headers.authorization.split("Bearer ")[1],
      },
    });
    const user = await User.findOne({
      where: {
        id: token.UserId,
      },
    });
    return res.json({ UserId: token.UserId, username: user.username });
  } catch (e) {
    return res.status(401).json({ error: "user not signed in" });
  }
});

// get user(s) with offset/cursor-based pagination
usersRouter.get("/", async (req, res) => {
  const query = req.query;
  if ("limit" in query) {
    const limit = query.limit;
    let state = {};
    const count = await User.count();
    if ("page" in query) {
      const offset = (req.query.page - 1) * limit;
      state = {
        limit: limit,
        offset: offset,
        order: [["createdAt", "DESC"]],
      };
    } else {
      // two actions in query is not allowed
      if ("next" in query && "prev" in query) {
        return res.status(422).json({
          error: "Incorrect query. Expected either one prev or next pointer.",
        });
      } else if ("next" in query) {
        state = {
          raw: true,
          limit: limit,
          where: {
            id: {
              [Op.lt]: query.next,
            },
          },
          order: [["id", "DESC"]],
        };
      } else if ("prev" in query) {
        state = {
          raw: true,
          limit: limit,
          where: {
            id: {
              [Op.gt]: query.prev,
            },
          },
          order: [["id", "DESC"]],
        };
      } else {
        state = {
          raw: true,
          limit: limit,
          order: [["id", "DESC"]],
        };
      }
    }
    const users = await User.findAll(state);
    if (users.length > 0) {
      const current =
        1 +
        (await User.count({
          where: {
            id: {
              [Op.gt]: users[0].id,
            },
          },
          order: [["id", "DESC"]],
        }));
      return res.json({
        users: users,
        prev: users[users.length - 1].id,
        next: users[users.length - 1].id + 1,
        count: count,
        current: current,
        totalPage: Math.floor((count - 1) / limit) + 1,
      });
    } else {
      return res.json({
        users: null,
        prev: null,
        next: null,
        count: 0,
        current: null,
        totalPage: Math.floor((count - 1) / limit) + 1,
      });
    }
  } else {
    return res.status(422).json({
      error: "Missing required query. Expected both limit and page number.",
    });
  }
});

// get a user's image by userId
usersRouter.get("/:userId/images", async (req, res) => {
  const query = req.query;
  if ("limit" in query) {
    const limit = query.limit;
    let state = {};
    // two actions in query is not allowed
    if ("next" in query && "prev" in query) {
      return res.status(422).json({
        error: "Incorrect query. Expected either one prev or next pointer.",
      });
    } else if ("next" in query) {
      state = {
        raw: true,
        limit: limit,
        where: {
          id: {
            [Op.lt]: query.next,
          },
          UserId: req.params.userId,
        },
        order: [["id", "DESC"]],
        include: { association: "User", attributes: ["username", "id"] },
      };
    } else if ("prev" in query) {
      state = {
        raw: true,
        limit: limit,
        where: {
          id: {
            [Op.gt]: query.prev,
          },
          UserId: req.params.userId,
        },
        order: [["id", "ASC"]],
        include: { association: "User", attributes: ["username", "id"] },
      };
    } else {
      state = {
        raw: true,
        limit: limit,
        where: {
          UserId: req.params.userId,
        },
        order: [["id", "DESC"]],
        include: { association: "User", attributes: ["username", "id"] },
      };
    }
    const image = await Image.findAll(state);
    const count = await Image.count({
      where: {
        UserId: req.params.userId,
      },
    });
    if (image.length > 0) {
      const current =
        1 +
        (await Image.count({
          where: {
            id: {
              [Op.gt]: image[0].id,
            },
            UserId: req.params.userId,
          },
          order: [["id", "DESC"]],
        }));
      return res.json({
        image: image[0],
        prev: image[0].id,
        next: image[0].id + 1,
        count: count,
        current: current,
      });
    } else {
      return res.json({
        image: null,
        prev: null,
        next: null,
        count: 0,
        current: null,
      });
    }
  } else {
    return res.status(422).json({
      error: "Missing required query. Expected limit.",
    });
  }
});
