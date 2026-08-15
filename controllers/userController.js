const bcrypt = require("bcryptjs");
const User = require("../models/user");

exports.signupForm = (req, res) => {
  res.render("users/signup");
};

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    req.flash("error", "All fields are required.");
    return res.redirect("/signup");
  }

  const existing = await User.findOne({
    $or: [
      { username },
      { email: email.toLowerCase() }
    ]
  });

  if (existing) {
    req.flash("error", "Username or email already exists.");
    return res.redirect("/signup");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    username,
    email,
    passwordHash
  });

  req.session.userId = user._id;

  req.flash("success", "Welcome! Your account was created.");
  res.redirect("/listings");
};

exports.loginForm = (req, res) => {
  res.render("users/login");
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) {
    req.flash("error", "Invalid username or password.");
    return res.redirect("/login");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    req.flash("error", "Invalid username or password.");
    return res.redirect("/login");
  }

  req.session.userId = user._id;

  const returnTo = req.session.returnTo || "/listings";
  delete req.session.returnTo;

  req.flash("success", `Welcome back, ${user.username}!`);
  res.redirect(returnTo);
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);

    res.clearCookie("connect.sid");
    res.redirect("/listings");
  });
};
