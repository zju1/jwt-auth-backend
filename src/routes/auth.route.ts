import { Router } from "express";
import {
  signInController,
  signupController,
  verifyController,
} from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/signup", signupController);
authRouter.post("/verify", verifyController);
authRouter.post("/signIn", signInController);

export default authRouter;
