/**
 * Seed Script: Popular Hair Extensions (Nigerian Market)
 * Run with:  node src/seed/seedHairExtensions.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");

// Adjust this URI to match your test/prod connection
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hairapp";

const seedData = [
  // --- Straight Textures ---
  {
    name: "Natural Black Straight Hair Extensions",
    description:
      "Premium natural black straight hair extensions — sleek, smooth, and perfect for any occasion.",
    price: 15000,
    attributes: {
      texture: "Straight",
      colors: ["Natural Black"],
      inchesOptions: [14, 16, 18, 20, 22],
      weftType: "Double Weft",
      bundleWeight: "100g",
    },
  },
  {
    name: "Jet Black 18\" Straight Hair Extensions",
    description:
      "18 inch jet black straight hair extensions with natural shine and flow.",
    price: 18000,
    attributes: {
      texture: "Straight",
      colors: ["Jet Black"],
      inchesOptions: [18],
      weftType: "Double Weft",
      bundleWeight: "100g",
    },
  },
  {
    name: "Brown Straight Silky Extensions",
    description:
      "Silky brown straight extensions for a refined, everyday elegance.",
    price: 16000,
    attributes: {
      texture: "Straight",
      colors: ["Brown"],
      inchesOptions: [16, 18, 20],
      weftType: "Double Weft",
      bundleWeight: "100g",
    },
  },

  // --- Body Wave Textures ---
  {
    name: "Natural Black Body Wave Extensions",
    description:
      "Body wave extensions with soft, natural waves that bounce with movement.",
    price: 17000,
    attributes: {
      texture: "Body Wave",
      colors: ["Natural Black"],
      inchesOptions: [16, 18, 20, 22],
      weftType: "Double Weft",
      bundleWeight: "100g",
    },
  },
  {
    name: "Honey Brown Body Wave Extensions",
    description:
      "Honey brown body wave bundles offering soft waves with warm tones.",
    price: 17500,
    attributes: {
      texture: "Body Wave",
      colors: ["Honey Brown"],
      inchesOptions: [18, 20, 22],
      weftType: "Double Weft",
      bundleWeight: "100g",
    },
  },
  {
    name: "Jet Black Body Wave 22\"",
    description:
      "22 inch jet black body wave extensions — luxe and full of movement.",
    price: 22000,
    attributes: {
      texture: "Body Wave",
      colors: ["Jet Black"],
      inchesOptions: [22],
      weftType: "Double Weft",
      bundleWeight: "100g",
    },
  },

  // --- Deep Wave Textures ---
  {
    name: "Natural Black Deep Wave Extensions",
    description:
      "Deep wave extensions with rich texture, ideal for fullness and style.",
    price: 17500,
    attributes: {
      texture: "Deep Wave",
      colors: ["Natural Black"],
      inchesOptions: [16, 18, 20, 22],
      weftType: "Double Weft",
      bundleWeight: "100g",
    },
  },
  {
    name: "Dark Brown Deep Wave 20\"",
    description:
      "20 inch dark brown deep wave hair extensions with premium density.",
    price: 21000,
    attributes: {
      texture: "Deep Wave",
      colors: ["Dark Brown"],
      inchesOptions: [20],
      weftType: "Double Weft",
      bundleWeight: "100g",
    },
  },
  {
    name: "Jet Black Deep Wave 22\"",
    description:
      "22 inch jet black deep wave extensions offering bounce and volume.",
    price: 23000,
    attributes: {
      texture: "Deep Wave",
      colors: ["Jet Black"],
      inchesOptions: [22],
      weftType: "Double Weft",
      bundleWeight: "100g",
    },
  },

  // --- Curly Textures ---
  {
    name: "Natural Black Curly Hair Extensions",
    description:
      "Curly extensions with defined spirals and natural texture.",
    price: 18000,
    attributes: {
      texture: "Curly",
      colors: ["Natural Black"],
      inchesOptions: [14, 16, 18],
      weftType: "Double Weft",
      bundleWeight: "100g",
    },
  },
  {
    name: "Jet Black Curly 18\"",
    description:
      "18 inch jet black curly extensions — voluminous and lively.",
    price: 20000,
    attributes: {
      texture: "Curly",
      colors: ["Jet Black"],
      inchesOptions: [18],
      weftType: "Double Weft",
      bundleWeight: "100g",
    },
  },
  {
    name: "Dark Brown Curly 20\"",
    description:
      "20 inch dark brown curly extensions for bold, beautiful curls.",
    price: 21500,
    attributes: {
      texture: "Curly",
      colors: ["Dark Brown"],
      inchesOptions: [20],
      weftType: "Double Weft",
      bundleWeight: "100g",
    },
  },

  // --- Loose Wave Textures ---
  {
    name: "Natural Black Loose Wave Extensions",
    description:
      "Loose wave extensions for a relaxed, beachy wave aesthetic.",
    price: 17000,
    attributes: {
      texture: "Loose Wave",
      colors: ["Natural Black"],
      inchesOptions: [16, 18, 20, 22],
      weftType: "Double Weft",
      bundleWeight: "100g",
    },
  },
  {
    name: "Brown Loose Wave 20\"",
    description:
      "20 inch brown loose wave hair extensions with soft flow.",
    price: 21000,
    attributes: {
      texture: "Loose Wave",
      colors: ["Brown"],
      inchesOptions: [20],
      weftType: "Double Weft",
      bundleWeight: "100g",
    },
  },
  {
    name: "Jet Black Loose Wave 22\"",
    description:
      "22 inch jet black loose wave bundles — glossy and full.",
    price: 23000,
    attributes: {
      texture: "Loose Wave",
      colors: ["Jet Black"],
      inchesOptions: [22],
      weftType: "Double Weft",
      bundleWeight: "100g",
    },
  },

  // --- Colored Highlights & Ombre ---
  {
    name: "Honey Blonde Ombre Extensions",
    description:
      "Ombre extensions transitioning from natural black to honey blonde.",
    price: 22000,
    attributes: {
      texture: "Body Wave",
      colors: ["Black → Honey Blonde"],
      inchesOptions: [18, 20, 22],
      weftType: "Double Weft",
      bundleWeight: "100g",
    },
  },
  {
    name: "Brown to Blonde Ombre Extensions",
    description:
      "Brown to blonde ombre — soft gradient with subtle shine.",
    price: 22500,
    attributes: {
      texture: "Loose Wave",
      colors: ["Brown → Blonde"],
      inchesOptions: [18, 20, 22],
      weftType: "Double Weft",
      bundleWeight: "100g",
    },
  },
  {
    name: "Dark Brown to Red Ombre",
    description:
      "Deep brown to red ombre extensions — bold and unique.",
    price: 24000,
    attributes: {
      texture: "Deep Wave",
      colors: ["Dark Brown → Red"],
      inchesOptions: [20, 22],
      weftType: "Double Weft",
      bundleWeight: "100g",
    },
  },

  // --- Long & Luxury ---
  {
    name: "Jet Black 24\" Straight Luxury Extensions",
    description:
      "Long and sleek 24 inch jet black straight extensions for a refined look.",
    price: 28000,
    attributes: {
      texture: "Straight",
      colors: ["Jet Black"],
      inchesOptions: [24],
      weftType: "Double Weft",
      bundleWeight: "100g",
    },
  },
  {
    name: "Brown 24\" Body Wave Extensions",
    description:
      "24 inch brown body wave — long, luxurious movement.",
    price: 28500,
    attributes: {
      texture: "Body Wave",
      colors: ["Brown"],
      inchesOptions: [24],
      weftType: "Double Weft",
      bundleWeight: "100g",
    },
  },
  {
    name: "Natural Black 26\" Loose Wave",
    description:
      "Elegant 26 inch natural black loose wave extensions.",
    price: 30000,
    attributes: {
      texture: "Loose Wave",
      colors: ["Natural Black"],
      inchesOptions: [26],
      weftType: "Double Weft",
      bundleWeight: "100g",
    },
  },
  {
    name: "Jet Black 28\" Curly Extensions",
    description:
      "28 inch jet black curly extensions with rich volume.",
    price: 32000,
    attributes: {
      texture: "Curly",
      colors: ["Jet Black"],
      inchesOptions: [28],
      weftType: "Double Weft",
      bundleWeight: "100g",
    },
  },
  {
    name: "Brown 30\" Deep Wave Extensions",
    description:
      "30 inch brown deep wave — long, gorgeous texture.",
    price: 35000,
    attributes: {
      texture: "Deep Wave",
      colors: ["Brown"],
      inchesOptions: [30],
      weftType: "Double Weft",
      bundleWeight: "100g",
    },
  },
];

async function seedHairExtensions() {
  await mongoose.connect(MONGO_URI);

  console.log("🧹 Clearing existing hair extensions...");
  await Product.deleteMany({});

  const category = await Category.findOne({ name: "Hair Extensions" });
  if (!category) {
    console.error("⚠️ Category 'Hair Extensions' not found!");
    process.exit(1);
  }

  const productsToInsert = seedData.map((p) => ({
    ...p,
    category: category._id,
  }));

  await Product.insertMany(productsToInsert);

  console.log(`✅ Seeded ${productsToInsert.length} hair extensions`);
  process.exit(0);
}

seedHairExtensions();
