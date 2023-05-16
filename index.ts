import express, { Express } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./src/middleware/auth.middleware";
import authRouter from "./src/routes/auth.route";
import privateRouter from "./src/routes/private.route";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const dbURI = process.env.DB_URI as string;

/* Middleware */
app.use(express.json());
app.use(cookieParser());

/* Routes */
app.use("/auth", authRouter);
app.use("/data", authMiddleware, privateRouter);

mongoose.connect(dbURI).then(() => {
  app.listen(port, () => {
    console.log(`Server is running on ${port}th port`);
  });
});
