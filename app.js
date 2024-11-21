import express from "express";
import bodyParser from "body-parser";
import { sequelize } from "./datasource.js";
import { commentsRouter } from "./routers/comments_router.js";
import { imagesRouter } from "./routers/images_router.js";
import { usersRouter } from "./routers/users_router.js";

export const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("static"));

try {
  await sequelize.authenticate();
  await sequelize.sync({ alter: { drop: false } });
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

app.use(function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);
  next();
});

app.use("/api/comments", commentsRouter);
app.use("/api/images", imagesRouter);
app.use("/api/users", usersRouter);

app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});
