const bcrypt = require("bcryptjs");
const User = require("../models/user");


// ======================================
// SIGNUP PAGE
// ======================================

exports.signupForm = (req, res) => {

    console.log("GET /signup");

    res.render("users/signup");
};


// ======================================
// SIGNUP
// ======================================

exports.signup = async (req, res) => {

    try {

        console.log("================================");
        console.log("POST /signup RECEIVED");
        console.log("BODY:", req.body);
        console.log("================================");


        const { username, email, password } = req.body;


        // Check fields
        if (!username || !email || !password) {

            req.flash(
                "error",
                "All fields are required."
            );

            return res.redirect("/signup");
        }


        const cleanUsername = username.trim();

        const cleanEmail = email.trim().toLowerCase();


        // Check existing user
        const existing = await User.findOne({

            $or: [

                {
                    username: cleanUsername
                },

                {
                    email: cleanEmail
                }

            ]

        });


        if (existing) {

            console.log(
                "User already exists:",
                existing.username
            );

            req.flash(
                "error",
                "Username or email already exists."
            );

            return res.redirect("/signup");
        }


        // Hash password
        const passwordHash =
            await bcrypt.hash(password, 12);


        // Create user
        const user = await User.create({

            username: cleanUsername,

            email: cleanEmail,

            passwordHash: passwordHash

        });


        console.log(
            "USER CREATED:",
            user.username
        );


        // Save user in session
        req.session.userId = user._id;


        req.flash(
            "success",
            "Welcome! Your account was created."
        );


        return res.redirect("/listings");


    } catch (err) {

        console.error(
            "SIGNUP ERROR:",
            err
        );


        req.flash(
            "error",
            "Something went wrong during signup."
        );


        return res.redirect("/signup");
    }
};



// ======================================
// LOGIN PAGE
// ======================================

exports.loginForm = (req, res) => {

    console.log("GET /login");

    res.render("users/login");
};



// ======================================
// LOGIN
// ======================================

exports.login = async (req, res) => {

    try {

        console.log("================================");
        console.log("POST /login RECEIVED");
        console.log("BODY:", req.body);
        console.log("================================");


        const { username, password } = req.body;


        if (!username || !password) {

            req.flash(
                "error",
                "Username and password are required."
            );

            return res.redirect("/login");
        }


        const user = await User.findOne({

            username: username.trim()

        });


        if (!user) {

            console.log(
                "USER NOT FOUND:",
                username
            );

            req.flash(
                "error",
                "Invalid username or password."
            );

            return res.redirect("/login");
        }


        const valid =
            await bcrypt.compare(
                password,
                user.passwordHash
            );


        if (!valid) {

            console.log(
                "WRONG PASSWORD"
            );

            req.flash(
                "error",
                "Invalid username or password."
            );

            return res.redirect("/login");
        }


        // Login successful
        req.session.userId = user._id;


        console.log(
            "LOGIN SUCCESS:",
            user.username
        );


        const returnTo =
            req.session.returnTo ||
            "/listings";


        delete req.session.returnTo;


        req.flash(
            "success",
            `Welcome back, ${user.username}!`
        );


        return res.redirect(returnTo);


    } catch (err) {

        console.error(
            "LOGIN ERROR:",
            err
        );


        req.flash(
            "error",
            "Something went wrong during login."
        );


        return res.redirect("/login");
    }
};



// ======================================
// LOGOUT
// ======================================

exports.logout = (req, res, next) => {

    console.log("POST /logout");


    req.session.destroy((err) => {

        if (err) {

            console.error(
                "LOGOUT ERROR:",
                err
            );

            return next(err);
        }


        res.clearCookie(
            "connect.sid"
        );


        return res.redirect(
            "/listings"
        );

    });
};