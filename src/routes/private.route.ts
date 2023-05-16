import { Router } from "express";

const privateRouter = Router();

privateRouter.get("/", (_req, res) => res.json("Hey, you got it!"));

export default privateRouter;