const bcrypt = require("bcryptjs");

const User = require("../models/user");


// ==============================
// SIGNUP PAGE
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

        if (
            !username ||
            !email ||
            !password
        ) {

            req.flash(
                "error",
                "All fields are required."
            );

            return res.redirect(
                "/signup"
            );

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


        if (existing) {

            req.flash(
                "error",
                "Username or email already exists."
            );

            return res.redirect(
                "/signup"
            );

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

                passwordHash:
                    passwordHash

            });


        // Save user in session

        req.session.userId =
            user._id;


        req.flash(
            "success",
            "Welcome! Your account was created successfully."
        );


        // IMPORTANT:
        // Save session before redirect

        req.session.save(
            (err) => {

                if (err) {

                    console.error(
                        "Session save error:",
                        err
                    );

                    return res.status(500).send(
                        "Session error"
                    );

                }

                res.redirect(
                    "/listings"
                );

            }
        );

    } catch (err) {

        console.error(
            "Signup Error:",
            err
        );


        // Duplicate username/email

        if (err.code === 11000) {

            req.flash(
                "error",
                "Username or email already exists."
            );

            return res.redirect(
                "/signup"
            );

        }


        req.flash(
            "error",
            "Something went wrong during signup."
        );

        res.redirect(
            "/signup"
        );

    }

};


// ==============================
// LOGIN PAGE
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


        if (
            !username ||
            !password
        ) {

            req.flash(
                "error",
                "Username and password are required."
            );

            return res.redirect(
                "/login"
            );

        }


        const user =
            await User.findOne({

                username:
                    username.trim()

            });


        if (!user) {

            req.flash(
                "error",
                "Invalid username or password."
            );

            return res.redirect(
                "/login"
            );

        }


        const valid =
            await bcrypt.compare(
                password,
                user.passwordHash
            );


        if (!valid) {

            req.flash(
                "error",
                "Invalid username or password."
            );

            return res.redirect(
                "/login"
            );

        }


        // Save user ID

        req.session.userId =
            user._id;


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

        req.session.save(
            (err) => {

                if (err) {

                    console.error(
                        "Session save error:",
                        err
                    );

                    return res.status(500).send(
                        "Session error"
                    );

                }

                res.redirect(
                    returnTo
                );

            }
        );

    } catch (err) {

        console.error(
            "Login Error:",
            err
        );

        req.flash(
            "error",
            "Something went wrong during login."
        );

        res.redirect(
            "/login"
        );

    }

};


// ==============================
// LOGOUT
// ==============================

exports.logout = (req, res, next) => {

    req.session.destroy(
        (err) => {

            if (err) {

                return next(err);

            }


            res.clearCookie(
                "connect.sid"
            );


            res.redirect(
                "/listings"
            );

        }
    );

};