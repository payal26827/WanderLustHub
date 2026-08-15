const express = require("express");
const router = express.Router();

const listingController = require("../controllers/listingController");
const { isLoggedIn, isListingOwner } = require("../middleware/auth");
const { validateListing } = require("../middleware/validation");

const upload = require("../utils/upload");

router.get("/", listingController.index);
router.get("/new", isLoggedIn, listingController.newForm);

router.post(
  "/",
  isLoggedIn,
  upload.single("image"),
  validateListing,
  listingController.create
);

router.get("/:id/edit", isLoggedIn, isListingOwner, listingController.editForm);

router.put(
  "/:id",
  isLoggedIn,
  isListingOwner,
  upload.single("image"),
  validateListing,
  listingController.update
);

router.delete(
  "/:id",
  isLoggedIn,
  isListingOwner,
  listingController.destroy
);

router.post("/tax", listingController.toggleTax);

router.get("/:id", listingController.show);

module.exports = router;
