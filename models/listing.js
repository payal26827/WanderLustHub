const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    url: String,
    filename: String
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ["Trending", "Rooms", "Mountains", "Arctic", "Camping", "Beach", "City", "Farms"],
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review"
  }],
  geometry: {
    type: {
      type: String,
      enum: ["Point"]
    },
    coordinates: {
      type: [Number]
    }
  }
}, { timestamps: true });

module.exports = mongoose.model("Listing", listingSchema);
