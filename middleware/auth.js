import { Token } from "../models/tokens.js";

export const isAuthenticated = async function (req, res, next) {
  if (req.headers.authorization) {
    try {
      const token = await Token.findOne({
        where: {
          token: req.headers.authorization.split("Bearer ")[1],
        },
      });
      if (token) {
        if (new Date(token.expires) < new Date()) {
          // Token expired
          return res.status(403).json({ error: "Token expired" });
        }
      }
    } catch (e) {
      return res.status(401).json({ error: "Not Authenticated" });
    }
  } else {
    return res.status(401).json({ error: "Not Authenticated" });
  }
  next();
};
