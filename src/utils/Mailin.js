import nodemailer from "nodemailer";
import { config } from "../config/congif.js";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  port: "587",
  auth: {
    user: config.EMAIL,
    pass: config.PASSMAIL,
  },
});

