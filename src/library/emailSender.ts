import nodemailer from "nodemailer";

export default nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
