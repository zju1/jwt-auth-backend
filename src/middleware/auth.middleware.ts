import { NextFunction, Request, Response } from "express";
import jsonWebToken from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config()

const SECRET_KEY = process.env.JWT_SECRET_KEY as string;

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const jwt = req.cookies.jwt;
  if (jwt) {
    jsonWebToken.verify(jwt, SECRET_KEY, (err: any, _decodedToken: any) => {
      if (err) {
        res.status(400).json({ message: "JWT is not valid" });
        next({ message: "JWT is not valid" });
      } else {
        next();
      }
    });
  } else {
    res.status(400).json({ message: "JWT is not provided" });
    next({ message: "JWT is not provided" });
  }
};
