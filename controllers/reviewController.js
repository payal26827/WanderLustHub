const Listing = require("../models/listing");
const Review = require("../models/review");

exports.create = async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  const review = new Review({
    ...req.body.review,
    author: req.session.userId,
    listing: listing._id
  });

  await review.save();

  listing.reviews.push(review._id);
  await listing.save();

  req.flash("success", "Review added successfully!");
  res.redirect(`/listings/${listing._id}`);
};

exports.destroy = async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  await Review.findByIdAndDelete(req.params.reviewId);
  listing.reviews.pull(req.params.reviewId);
  await listing.save();

  req.flash("success", "Review deleted.");
  res.redirect(`/listings/${listing._id}`);
};
