const Joi = require("joi");
const ExpressError = require("../utils/ExpressError");

const listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().trim().min(3).max(100).required(),
    description: Joi.string().trim().min(10).max(5000).required(),
    price: Joi.number().min(0).required(),
    location: Joi.string().trim().min(2).max(100).required(),
    country: Joi.string().trim().min(2).max(100).required(),
    category: Joi.string()
      .valid("Trending", "Rooms", "Mountains", "Arctic", "Camping", "Beach", "City", "Farms")
      .required()
  }).required()
});

const reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().trim().min(2).max(1000).required()
  }).required()
});

function validateListing(req, res, next) {
  const { error } = listingSchema.validate(req.body);

  if (error) {
    throw new ExpressError(400, error.details.map((d) => d.message).join(", "));
  }

  next();
}

function validateReview(req, res, next) {
  const { error } = reviewSchema.validate(req.body);

  if (error) {
    throw new ExpressError(400, error.details.map((d) => d.message).join(", "));
  }

  next();
}

module.exports = { validateListing, validateReview };
