import { Request, Response } from "express";
import { IUser, User } from "../models/User";
import moment from "moment";
import otpGenerator from "otp-generator";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from 'bcrypt'

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET_KEY as string;
const COOKIE_EXPIRY_DATE = 1000 * 60 * 60 * 24;
const JWT_EXPIRY_DATE = "1d";

const createToken = (data: any) =>
  jwt.sign(data, SECRET_KEY, { expiresIn: JWT_EXPIRY_DATE });

export const signupController = async (
  req: Request<any, any, IUser>,
  res: Response
) => {
  try {
    const code = otpGenerator.generate(4, {
      lowerCaseAlphabets: false,
      specialChars: false,
      upperCaseAlphabets: false,
    });
    const date = moment().add(10, "minutes").toISOString();
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(req.body.password, salt);
    const user = await User.create({
      ...req.body,
      password: hash,
      verification: {
        code,
        expiry: date,
      },
    });
    const { verification, ...rest } = user.toJSON();
    res.status(201).json({ user: rest });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const verifyController = async (
  req: Request<any, any, Omit<IUser, "password" | "name"> & { code: string }>,
  res: Response
) => {
  const { code, email } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    if (user.verification) {
      const setTime = moment(user.verification.expiry);
      const currentTime = moment();
      const diff = currentTime.diff(setTime, "seconds");
      if (diff < 0) {
        if (code === user.verification.code) {
          user.verification = undefined;
          await user.save();
          const token = createToken(user.toObject());
          res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: COOKIE_EXPIRY_DATE,
          });
          return res.status(200).json({ user });
        } else {
          res.status(400).json({ message: "OTP didn't match" });
          return;
        }
      }
      await User.deleteOne({ email });
      res.status(400).json({
        ok: "Verification code is expired. Please request a new verification code.",
      });
      return;
    }
    res.status(400).json({ message: "User is already verified" });
    return;
  }
  res.status(404).json({ message: "User with this email not found" });
};

export const signInController = async (
  req: Request<any, any, { email: string; password: string }>,
  res: Response
) => {
  const { email, password } = req.body;
  try {
    const user = await (User as any).signIn(email, password);
    const token = createToken(user.toObject());
    res.cookie("jwt", token);
    res.status(200).json({ user });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
