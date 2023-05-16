import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser {
  email: string;
  password: string;
  name: string;
}

interface DBUser extends IUser {
  verification?: {
    code: string;
    expiry: Date;
  };
}

const userSchema = new Schema<DBUser>({
  email: {
    type: String,
    required: [true, "Email is required field"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required field"],
    minlength: [6, "Password must contain at least 6 character"],
  },
  name: {
    type: String,
    required: [true, "Name is required field"],
    minlength: [3, "Name must be at least 3 characters long"],
  },
  verification: {
    required: false,
    type: {
      code: String,
      expiry: Date,
    },
  },
});

userSchema.statics.signIn = async function (email, password) {
  const user = await this.findOne({ email });

  if (user) {
    const matched = await bcrypt.compare(password, user.password);
    if (matched) {
      return user;
    } else {
      throw new Error("Email or password incorrect");
    }
  } else {
    throw new Error("User not found");
  }
};

export const User = model("user", userSchema);
