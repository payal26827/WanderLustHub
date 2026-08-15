exports.toggle = (req, res) => {
  req.session.taxMode = !req.session.taxMode;
  res.redirect(req.get("Referrer") || "/listings");
};
