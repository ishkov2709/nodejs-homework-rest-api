const nodemailer = require("nodemailer");
require("dotenv").config();

const { AUTH_PASS, HOST_EMAIL } = process.env;

const configOptions = {
  service: "gmail",
  host: "smtp.gmail.com",
  secure: true,
  auth: {
    user: HOST_EMAIL,
    pass: AUTH_PASS,
  },
};

const transport = nodemailer.createTransport(configOptions);

module.exports = transport;
