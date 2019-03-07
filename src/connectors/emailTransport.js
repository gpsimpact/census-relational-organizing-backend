import nodemailer from "nodemailer";

export default nodemailer.createTransport({
  auth: {
    pass: process.env.MAIL_PASS,
    user: process.env.MAIL_USER
  },
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT
});
