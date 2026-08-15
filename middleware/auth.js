const Listing = require("../models/listing");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError");

const isLoggedIn = (req, res, next) => {
  if (!req.session.userId) {
    req.flash("error", "You must be logged in first.");
    req.session.returnTo = req.originalUrl;
    return res.redirect("/login");
  }
  next();
};

const isListingOwner = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  if (String(listing.owner) !== String(req.session.userId)) {
    req.flash("error", "You do not have permission to do that.");
    return res.redirect(`/listings/${listing._id}`);
  }

  req.listing = listing;
  next();
};

const isReviewAuthor = async (req, res, next) => {
  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    req.flash("error", "Review not found.");
    return res.redirect(`/listings/${req.params.id}`);
  }

  if (String(review.author) !== String(req.session.userId)) {
    req.flash("error", "You do not have permission to delete this review.");
    return res.redirect(`/listings/${req.params.id}`);
  }

  req.review = review;
  next();
};

const requireOwnerOrAuthor = (req, res, next) => next();

module.exports = {
  isLoggedIn,
  isListingOwner,
  isReviewAuthor,
  requireOwnerOrAuthor,
  ExpressError
};
