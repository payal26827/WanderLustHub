const express = require("express");
const router = express.Router();

router.get("/set", (req, res) => {
  res.cookie("theme", "light", {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24
  });

  res.cookie("role", "visitor", {
    signed: true,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24
  });

  res.send(`
    <h2>Cookies set</h2>
    <p>Normal cookie: theme=light</p>
    <p>Signed cookie: role=visitor</p>
    <a href="/cookies/read">Read cookies</a>
  `);
});

router.get("/read", (req, res) => {
  res.json({
    normalCookies: req.cookies,
    signedCookies: req.signedCookies
  });
});

router.post("/clear", (req, res) => {
  res.clearCookie("theme");
  res.clearCookie("role");
  res.redirect("/listings");
});

module.exports = router;
