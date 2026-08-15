// const Listing = require("../models/listing");
// const Review = require("../models/review");
// const { geocodeAddress } = require("../utils/geocode");
// const cloudinary = require("../utils/cloudinary");

// exports.index = async (req, res) => {
//   const { category, search, minPrice, maxPrice } = req.query;

//   const filter = {};

//   if (category && category !== "All") {
//     filter.category = category;
//   }

//   if (search) {
//     filter.$or = [
//       { title: { $regex: search, $options: "i" } },
//       { location: { $regex: search, $options: "i" } },
//       { country: { $regex: search, $options: "i" } }
//     ];
//   }

//   if (minPrice !== undefined || maxPrice !== undefined) {
//     filter.price = {};
//     if (minPrice !== undefined && minPrice !== "") filter.price.$gte = Number(minPrice);
//     if (maxPrice !== undefined && maxPrice !== "") filter.price.$lte = Number(maxPrice);
//   }

//   const listings = await Listing.find(filter).sort({ createdAt: -1 });

//   res.render("listings/index", {
//     listings,
//     filters: { category, search, minPrice, maxPrice }
//   });
// };

// exports.newForm = (req, res) => {
//   res.render("listings/new");
// };

// exports.create = async (req, res) => {
//   const listing = new Listing(req.body.listing);
//   listing.owner = req.session.userId;

//   if (req.file) {
//     listing.image = {
//       url: req.file.path,
//       filename: req.file.filename
//     };
//   }

//   listing.geometry = await geocodeAddress(
//     `${listing.location}, ${listing.country}`
//   );

//   await listing.save();

//   req.flash("success", "Listing created successfully!");
//   res.redirect(`/listings/${listing._id}`);
// };

// exports.show = async (req, res) => {
//   const listing = await Listing.findById(req.params.id)
//     .populate("owner")
//     .populate({
//       path: "reviews",
//       populate: { path: "author" }
//     });

//   if (!listing) {
//     req.flash("error", "Listing not found.");
//     return res.redirect("/listings");
//   }

//   res.render("listings/show", { listing });
// };

// exports.editForm = async (req, res) => {
//   const listing = req.listing;
//   res.render("listings/edit", { listing });
// };

// exports.update = async (req, res) => {
//   const listing = req.listing;

//   Object.assign(listing, req.body.listing);

//   if (req.file) {
//     if (listing.image?.filename) {
//       try {
//         await cloudinary.uploader.destroy(listing.image.filename);
//       } catch (err) {
//         console.warn("Old image delete failed:", err.message);
//       }
//     }

//     listing.image = {
//       url: req.file.path,
//       filename: req.file.filename
//     };
//   }

//   listing.geometry = await geocodeAddress(
//     `${listing.location}, ${listing.country}`
//   );

//   await listing.save();

//   req.flash("success", "Listing updated successfully!");
//   res.redirect(`/listings/${listing._id}`);
// };

// exports.destroy = async (req, res) => {
//   const listing = req.listing;

//   await Review.deleteMany({ _id: { $in: listing.reviews } });

//   if (listing.image?.filename) {
//     try {
//       await cloudinary.uploader.destroy(listing.image.filename);
//     } catch (err) {
//       console.warn("Image delete failed:", err.message);
//     }
//   }

//   await Listing.findByIdAndDelete(listing._id);

//   req.flash("success", "Listing deleted successfully.");
//   res.redirect("/listings");
// };

// exports.toggleTax = (req, res) => {
//   req.session.taxMode = !req.session.taxMode;
//   res.redirect(req.get("Referrer") || "/listings");
// };



const Listing = require("../models/listing");
const Review = require("../models/review");
const { geocodeAddress } = require("../utils/geocode");
const cloudinary = require("../utils/cloudinary");

// ===============================
// SHOW ALL LISTINGS
// ===============================

exports.index = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;

    const filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } }
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    const listings = await Listing.find(filter)
      .populate("owner")
      .sort({ createdAt: -1 });

    res.render("listings/index", {
      listings,
      filters: {
        category: category || "",
        search: search || "",
        minPrice: minPrice || "",
        maxPrice: maxPrice || ""
      }
    });

  } catch (err) {
    next(err);
  }
};


// ===============================
// SHOW CREATE LISTING FORM
// ===============================

exports.newForm = (req, res) => {
  res.render("listings/new");
};


// ===============================
// CREATE LISTING
// ===============================

exports.create = async (req, res, next) => {
  try {

    console.log("CREATE LISTING ROUTE HIT");
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    // Check listing data
    if (!req.body.listing) {
      req.flash("error", "Listing information is missing.");
      return res.redirect("/listings/new");
    }

    // Create listing
    const listing = new Listing(req.body.listing);

    // Set owner
    listing.owner = req.session.userId;

    // Save uploaded image
    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    }

    // Geocode location
    try {

      listing.geometry = await geocodeAddress(
        `${listing.location}, ${listing.country}`
      );

    } catch (err) {

      console.log("Geocoding failed:", err.message);

      // Default coordinates
      listing.geometry = {
        type: "Point",
        coordinates: [0, 0]
      };
    }

    // Save listing in MongoDB
    await listing.save();

    console.log("LISTING SAVED:", listing._id);

    req.flash(
      "success",
      "Listing created successfully!"
    );

    res.redirect(`/listings/${listing._id}`);

  } catch (err) {

    console.log(
      "CREATE LISTING ERROR:",
      err
    );

    req.flash(
      "error",
      err.message
    );

    res.redirect("/listings/new");
  }
};


// ===============================
// SHOW SINGLE LISTING
// ===============================

exports.show = async (req, res, next) => {
  try {

    const listing = await Listing.findById(
      req.params.id
    )
      .populate("owner")
      .populate({
        path: "reviews",
        populate: {
          path: "author"
        }
      });

    if (!listing) {
      req.flash(
        "error",
        "Listing not found."
      );

      return res.redirect("/listings");
    }

    res.render("listings/show", {
      listing
    });

  } catch (err) {
    next(err);
  }
};


// ===============================
// EDIT LISTING FORM
// ===============================

exports.editForm = async (req, res) => {

  const listing = req.listing;

  res.render(
    "listings/edit",
    {
      listing
    }
  );
};


// ===============================
// UPDATE LISTING
// ===============================

exports.update = async (req, res, next) => {
  try {

    const listing = req.listing;

    // Update text fields
    Object.assign(
      listing,
      req.body.listing
    );

    // Update image
    if (req.file) {

      // Delete old image
      if (
        listing.image &&
        listing.image.filename
      ) {

        try {

          await cloudinary.uploader.destroy(
            listing.image.filename
          );

        } catch (err) {

          console.log(
            "Old image delete failed:",
            err.message
          );
        }
      }

      // Save new image
      listing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    }

    // Update location
    try {

      listing.geometry =
        await geocodeAddress(
          `${listing.location}, ${listing.country}`
        );

    } catch (err) {

      console.log(
        "Geocoding failed:",
        err.message
      );

      listing.geometry = {
        type: "Point",
        coordinates: [0, 0]
      };
    }

    await listing.save();

    req.flash(
      "success",
      "Listing updated successfully!"
    );

    res.redirect(
      `/listings/${listing._id}`
    );

  } catch (err) {
    next(err);
  }
};


// ===============================
// DELETE LISTING
// ===============================

exports.destroy = async (
  req,
  res,
  next
) => {

  try {

    const listing = req.listing;

    // Delete reviews
    await Review.deleteMany({
      _id: {
        $in: listing.reviews
      }
    });

    // Delete image from Cloudinary
    if (
      listing.image &&
      listing.image.filename
    ) {

      try {

        await cloudinary.uploader.destroy(
          listing.image.filename
        );

      } catch (err) {

        console.log(
          "Image delete failed:",
          err.message
        );
      }
    }

    // Delete listing
    await Listing.findByIdAndDelete(
      listing._id
    );

    req.flash(
      "success",
      "Listing deleted successfully."
    );

    res.redirect("/listings");

  } catch (err) {
    next(err);
  }
};


// ===============================
// TAX TOGGLE
// ===============================

exports.toggleTax = (
  req,
  res
) => {

  req.session.taxMode =
    !req.session.taxMode;

  res.redirect(
    req.get("Referrer") ||
    "/listings"
  );
};