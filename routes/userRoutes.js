const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

// ==========================
// SIGNUP
// ==========================

router.get("/signup", userController.signupForm);

router.post("/signup", userController.signup);


// ==========================
// LOGIN
// ==========================

router.get("/login", userController.loginForm);

router.post("/login", userController.login);


// ==========================
// LOGOUT
// ==========================

router.post("/logout", userController.logout);


module.exports = router;