const express = require("express");
const router = express.Router({ mergeParams: true });

const reviewController = require("../controllers/reviewController");
const { isLoggedIn, isReviewAuthor } = require("../middleware/auth");
const { validateReview } = require("../middleware/validation");

router.post("/", isLoggedIn, validateReview, reviewController.create);

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  reviewController.destroy
);

module.exports = router;
