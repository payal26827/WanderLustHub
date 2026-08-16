const bcrypt = require("bcryptjs");
const User = require("../models/user");


// ==============================
// SIGNUP FORM
// ==============================

exports.signupForm = (req, res) => {

    res.render("users/signup");

};


// ==============================
// SIGNUP
// ==============================

exports.signup = async (req, res) => {

    try {

        const {
            username,
            email,
            password
        } = req.body;


        // Check empty fields
        if (!username || !email || !password) {

            req.flash(
                "error",
                "All fields are required."
            );

            return res.redirect("/signup");
        }


        // Clean data
        const cleanUsername =
            username.trim();

        const cleanEmail =
            email.trim().toLowerCase();


        // Check existing user
        const existing =
            await User.findOne({

                $or: [
                    {
                        username:
                            cleanUsername
                    },
                    {
                        email:
                            cleanEmail
                    }
                ]

            });


        // User already exists
        if (existing) {

            req.flash(
                "error",
                "Username or email already exists."
            );

            return res.redirect("/signup");
        }


        // Hash password
        const passwordHash =
            await bcrypt.hash(
                password,
                12
            );


        // Create user
        const user =
            await User.create({

                username:
                    cleanUsername,

                email:
                    cleanEmail,

                passwordHash

            });


        // Save user ID in session
        req.session.userId =
            user._id;


        req.flash(
            "success",
            "Welcome! Your account was created."
        );


        // IMPORTANT:
        // Save session before redirect
        req.session.save((err) => {

            if (err) {

                console.error(
                    "Session save error:",
                    err
                );

                req.flash(
                    "error",
                    "Login session could not be saved."
                );

                return res.redirect("/signup");
            }


            res.redirect("/listings");

        });

    } catch (err) {

        console.error(
            "Signup error:",
            err
        );


        // MongoDB duplicate error
        if (err.code === 11000) {

            req.flash(
                "error",
                "Username or email already exists."
            );

            return res.redirect("/signup");
        }


        req.flash(
            "error",
            "Something went wrong. Please try again."
        );

        res.redirect("/signup");

    }

};


// ==============================
// LOGIN FORM
// ==============================

exports.loginForm = (req, res) => {

    res.render("users/login");

};


// ==============================
// LOGIN
// ==============================

exports.login = async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;


        // Find user
        const user =
            await User.findOne({
                username:
                    username.trim()
            });


        // User not found
        if (!user) {

            req.flash(
                "error",
                "Invalid username or password."
            );

            return res.redirect("/login");
        }


        // Check password
        const valid =
            await bcrypt.compare(
                password,
                user.passwordHash
            );


        // Wrong password
        if (!valid) {

            req.flash(
                "error",
                "Invalid username or password."
            );

            return res.redirect("/login");
        }


        // Save user ID
        req.session.userId =
            user._id;


        // Redirect location
        const returnTo =
            req.session.returnTo ||
            "/listings";

        delete req.session.returnTo;


        req.flash(
            "success",
            `Welcome back, ${user.username}!`
        );


        // IMPORTANT:
        // Save session before redirect
        req.session.save((err) => {

            if (err) {

                console.error(
                    "Session save error:",
                    err
                );

                req.flash(
                    "error",
                    "Login session could not be saved."
                );

                return res.redirect("/login");
            }


            res.redirect(returnTo);

        });

    } catch (err) {

        console.error(
            "Login error:",
            err
        );

        req.flash(
            "error",
            "Something went wrong. Please try again."
        );

        res.redirect("/login");

    }

};


// ==============================
// LOGOUT
// ==============================

exports.logout = (req, res, next) => {

    req.session.destroy((err) => {

        if (err) {

            return next(err);

        }


        res.clearCookie(
            "connect.sid"
        );


        res.redirect(
            "/listings"
        );

    });

};