// ==============================
// LOAD ENVIRONMENT VARIABLES
// ==============================

const dns = require("dns");

// Force Node.js to use Google DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();


// ==============================
// IMPORT PACKAGES
// ==============================

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");


// ==============================
// IMPORT FILES
// ==============================

const ExpressError = require("./utils/ExpressError");

const listingRoutes = require("./routes/listingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const userRoutes = require("./routes/userRoutes");
const cookieRoutes = require("./routes/cookieRoutes");


// ==============================
// CREATE APP
// ==============================

const app = express();

// IMPORTANT FOR RENDER
app.set("trust proxy", 1);

const PORT = process.env.PORT || 8080;


// ==============================
// CHECK ENV VARIABLES
// ==============================

console.log(
    "MONGO_URL:",
    process.env.MONGO_URL ? "FOUND" : "MISSING"
);

console.log(
    "SESSION_SECRET:",
    process.env.SESSION_SECRET ? "FOUND" : "MISSING"
);

console.log(
    "CLOUDINARY_API_KEY:",
    process.env.CLOUDINARY_API_KEY ? "FOUND" : "MISSING"
);


// ==============================
// EJS SETUP
// ==============================

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");

app.set(
    "views",
    path.join(__dirname, "views")
);


// ==============================
// BASIC MIDDLEWARE
// ==============================

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

app.use(
    methodOverride("_method")
);


// ==============================
// COOKIE PARSER
// ==============================

app.use(
    cookieParser(
        process.env.SESSION_SECRET
    )
);


// ==============================
// CHECK MONGO URL
// ==============================

if (!process.env.MONGO_URL) {

    console.error(
        "ERROR: MONGO_URL is missing in .env file"
    );

    process.exit(1);
}


// ==============================
// CHECK SESSION SECRET
// ==============================

if (!process.env.SESSION_SECRET) {

    console.error(
        "ERROR: SESSION_SECRET is missing in .env file"
    );

    process.exit(1);
}


// ==============================
// MONGO SESSION STORE
// ==============================

const store = MongoStore.create({

    mongoUrl: process.env.MONGO_URL,

    collectionName: "sessions",

    ttl: 14 * 24 * 60 * 60

});


store.on(
    "error",
    (err) => {

        console.error(
            "Mongo session store error:",
            err
        );

    }
);


// ==============================
// SESSION
// ==============================

app.use(
    session({

        store: store,

        secret: process.env.SESSION_SECRET,

        resave: false,

        saveUninitialized: false,

        cookie: {

            maxAge:
                1000 *
                60 *
                60 *
                24 *
                7,

            httpOnly: true,

            sameSite: "lax",

            secure:
                process.env.NODE_ENV === "production"

        }

    })
);


// ==============================
// FLASH
// ==============================

app.use(flash());


// ==============================
// GLOBAL VARIABLES
// ==============================

app.use(
    (req, res, next) => {

        res.locals.success =
            req.flash("success");

        res.locals.error =
            req.flash("error");

        res.locals.currentUser =
            req.session.userId || null;

        res.locals.taxMode =
            req.session.taxMode || false;


        // Navbar search filters
        res.locals.filters = {

            category:
                req.query.category || "",

            search:
                req.query.search || "",

            minPrice:
                req.query.minPrice || "",

            maxPrice:
                req.query.maxPrice || ""

        };

        next();

    }
);


// ==============================
// HOME ROUTE
// ==============================

app.get(
    "/",
    (req, res) => {

        res.redirect("/listings");

    }
);


// ==============================
// HEALTH CHECK
// ==============================

app.get(
    "/health",
    (req, res) => {

        res.json({
            ok: true
        });

    }
);


// ==============================
// ROUTES
// ==============================

// Listing routes
app.use(
    "/listings",
    listingRoutes
);


// Review routes
app.use(
    "/listings/:id/reviews",
    reviewRoutes
);


// User routes
app.use(
    "/",
    userRoutes
);


// Cookie routes
app.use(
    "/cookies",
    cookieRoutes
);


// ==============================
// 404 ERROR
// ==============================

app.all(
    "*splat",
    (req, res, next) => {

        next(
            new ExpressError(
                404,
                "Page not found"
            )
        );

    }
);


// ==============================
// ERROR HANDLING
// ==============================

app.use(
    (err, req, res, next) => {

        console.error(
            "ERROR:",
            err
        );

        const status =
            err.statusCode || 500;

        const message =
            err.message ||
            "Something went wrong";


        if (req.accepts("html")) {

            return res
                .status(status)
                .render(
                    "error",
                    {
                        err: {

                            statusCode:
                                status,

                            message:
                                message

                        }
                    }
                );

        }


        res
            .status(status)
            .json({

                error:
                    message

            });

    }
);


// ==============================
// DATABASE + SERVER
// ==============================

async function start() {

    try {

        // ==========================
        // CONNECT MONGODB
        // ==========================

        console.log(
            "Connecting to MongoDB..."
        );

        await mongoose.connect(
            process.env.MONGO_URL
        );

        console.log(
            "Connected to MongoDB"
        );


        // ==========================
        // START SERVER
        // ==========================

        app.listen(
            PORT,
            () => {

                console.log(
                    `Server running on port ${PORT}`
                );

            }
        );

    } catch (err) {

        console.error(
            "Database connection failed:",
            err
        );

        process.exit(1);

    }

}


// ==============================
// START APPLICATION
// ==============================

start();