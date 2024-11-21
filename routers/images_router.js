import { Router } from "express";
import { Image } from "../models/images.js";
import { Comment } from "../models/comments.js";
import { Op } from "sequelize";
import { isAuthenticated } from "../middleware/auth.js";
import path from "path";
import multer from "multer";

export const imagesRouter = Router();

const upload = multer({ dest: "uploads/" });

imagesRouter.post(
  "/",
  upload.single("picture"),
  isAuthenticated,
  async (req, res) => {
    try {
      const allowedExtension = ["jpeg", "jpg", "png", "gif", "bmp"];
      if (!allowedExtension.includes(req.file.mimetype.split("/")[1])) {
        return res.status(422).json({
          error: "Invalid file type. Expected jpeg, jpg, png, gif, or bmp.",
        });
      }
      await Image.create({
        title: req.body.title,
        file: req.file,
        UserId: req.body.author,
      });
      return res.json({ message: "Image uploaded successfully." });
    } catch (e) {
      if (e.name === "SequelizeValidationError") {
        return res.status(422).json({
          error: "Invalid input parameters. Expected title, file, and author.",
        });
      } else {
        return res.status(400).json({ error: "Cannot create an image" });
      }
    }
  },
);

imagesRouter.get("/:id", async (req, res) => {
  let imageId = req.params.id;
  const image = await Image.findByPk(imageId);
  if (image === null) {
    return res.status(404).json({ errors: "Image not found." });
  }
  const allowedExtension = ["jpeg", "jpg", "png", "gif", "bmp"];
  if (!allowedExtension.includes(image.file.mimetype.split("/")[1])) {
    return res.status(422).json({
      error: "Invalid file type. Expected jpeg, jpg, png, gif, or bmp.",
    });
  }
  res.setHeader("Content-Type", image.file.mimetype);
  res.sendFile(image.file.path, { root: path.resolve() });
});

// Note that it does not delete comments under the image to be removed.
// There may be a case where users want to see all comments they wrote so far.
imagesRouter.delete("/:id", isAuthenticated, async (req, res) => {
  const image = await Image.findByPk(req.params.id);
  if (!image) {
    return res
      .status(404)
      .json({ error: "Image id:" + req.params.id + " does not exists" });
  }
  await image.destroy();
  return res.json(image);
});

// offset pagination
imagesRouter.get("/:imageId/comments", isAuthenticated, async (req, res) => {
  if ("limit" in req.query && "page" in req.query) {
    const limit = req.query.limit;
    const offset = (req.query.page - 1) * limit;
    const count = await Comment.count({
      where: {
        ImageId: req.params.imageId,
      },
    });
    const comments = await Comment.findAll({
      limit: limit,
      offset: offset,
      order: [["createdAt", "DESC"]],
      where: {
        ImageId: req.params.imageId,
      },
      include: { association: "User", attributes: ["username"] },
    });
    return res.json({
      comments: comments,
      totalPage: Math.floor((count - 1) / limit) + 1,
    });
  } else {
    return res.status(422).json({
      error: "Missing required query. Expected both limit and page number.",
    });
  }
});
