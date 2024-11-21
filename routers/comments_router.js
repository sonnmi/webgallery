import { Router } from "express";
import { Comment } from "../models/comments.js";
import { isAuthenticated } from "../middleware/auth.js";

export const commentsRouter = Router();

commentsRouter.post("/", isAuthenticated, async (req, res) => {
  if (
    !(
      "content" in req.body &&
      "imageId" in req.body &&
      "userId" in req.body &&
      Object.keys(req.body).length === 3
    ) ||
    typeof req.body.content !== "string"
  ) {
    return res
      .status(422)
      .json({ error: "Invalid fields. Expected author, content, and id." });
  }
  const comment = await Comment.create({
    content: req.body.content,
    ImageId: req.body.imageId,
    UserId: req.body.userId,
  });
  return res.json(comment);
});

commentsRouter.delete("/:id", isAuthenticated, async (req, res) => {
  const comment = await Comment.findByPk(req.params.id);
  if (!comment) {
    return res
      .status(404)
      .json({ error: "Comment id:" + req.params.id + " does not exists" });
  }
  await comment.destroy();
  return res.json(comment);
});
