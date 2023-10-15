const { User } = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs/promises");
const path = require("path");
const gravatar = require("gravatar");
const { HttpError, ctrlWrapper, transport } = require("../helpers");
const Jimp = require("jimp");
const { nanoid } = require("nanoid");

const { SECRET_KEY, BASE_URL, HOST_EMAIL } = process.env;
const uploadFolder = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) throw HttpError(409, "Email in use");

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken: nanoid(),
  });

  const emailOptions = {
    from: HOST_EMAIL,
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${newUser.verificationToken}">Click verify email</a>`,
  };

  transport.sendMail(emailOptions);

  res.status(201).json({
    email: newUser.email,
    subscription: newUser.subscription,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) throw HttpError(401, "Email or password is wrong");

  if (!user.verify) throw HttpError(401, "Email not verify");

  const match = await bcrypt.compare(password, user.password);

  if (!match) throw HttpError(401, "Email or password is wrong");

  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user.id, { token });

  res.json({
    token: token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const logout = async (req, res) => {
  const { id } = req.user;

  await User.findByIdAndUpdate(id, { token: "" });

  res.status(204).send();
};

const current = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

const updateSubscription = async (req, res) => {
  const { id } = req.user;
  const user = await User.findByIdAndUpdate(id, req.body, { new: true });

  res.json({
    email: user.email,
    subscription: user.subscription,
  });
};

const updateAvatar = async (req, res) => {
  const { id } = req.user;
  const { path: tempFile, originalname } = req.file;
  const newName = `${id}${originalname}`;
  const uploadFile = path.join(uploadFolder, newName);

  (await Jimp.read(tempFile)).resize(250, 250).quality(60).write(uploadFile);
  await fs.unlink(tempFile);

  const avatarURL = path.join("/", "avatars", newName);

  await User.findByIdAndUpdate(id, { avatarURL });

  res.json({
    avatarURL,
  });
};

const verificateUser = async (req, res) => {
  const { verificationToken } = req.params;

  const user = await User.findOne({ verificationToken });

  if (!user) throw HttpError(404, "User not found");

  await User.findByIdAndUpdate(user.id, {
    verify: true,
    verificationToken: "",
  });

  res.json({
    message: "Verification successful",
  });
};

const resendVerify = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) throw HttpError(404, "User not found");
  if (user.verify) throw HttpError(400, "Verification has already been passed");

  const emailOptions = {
    from: HOST_EMAIL,
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Click verify email</a>`,
  };

  transport.sendMail(emailOptions);

  res.json({
    message: "Verification email sent",
  });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  current: ctrlWrapper(current),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
  verificateUser: ctrlWrapper(verificateUser),
  resendVerify: ctrlWrapper(resendVerify),
};
