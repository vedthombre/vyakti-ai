// Mock E-Commerce Database for Vyakti
// Complete realistic quick-commerce ecosystem with 3 merchants

const MERCHANTS = {
  blinkit: { id: "blinkit", name: "Blinkit", baseDeliveryTime: 8, logo: "🟡", website: "blinkit.com" },
  zepto: { id: "zepto", name: "Zepto", baseDeliveryTime: 10, logo: "🟣", website: "zepto.in" },
  instamart: { id: "instamart", name: "Instamart", baseDeliveryTime: 12, logo: "🔵", website: "instamart.flipkart.com" },
};

// Master product catalog with all variants and pricing
const PRODUCTS = [
  // ── MILK ──
  {
    id: "milk_amul_full_cream",
    baseVariant: "Amul Full Cream",
    category: "Dairy",
    variants: [
      { name: "Amul Gold Full Cream Milk 500ml", sku: "amul_full_500", prices: { blinkit: 34, zepto: 36, instamart: 35 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "Amul Gold Full Cream Milk 1L", sku: "amul_full_1l", prices: { blinkit: 68, zepto: 70, instamart: 68 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "Amul Gold Full Cream Milk 2L", sku: "amul_full_2l", prices: { blinkit: 135, zepto: 138, instamart: 136 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "Amul Gold Full Cream Milk 5L", sku: "amul_full_5l", prices: { blinkit: 340, zepto: 345, instamart: 342 }, inStock: { blinkit: false, zepto: false, instamart: true } },
    ],
  },
  {
    id: "milk_amul_taaza",
    baseVariant: "Amul Taaza",
    category: "Dairy",
    variants: [
      { name: "Amul Taaza Toned Milk 500ml", sku: "amul_taaza_500", prices: { blinkit: 30, zepto: 32, instamart: 30 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "Amul Taaza Toned Milk 1L", sku: "amul_taaza_1l", prices: { blinkit: 58, zepto: 60, instamart: 58 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "Amul Taaza Toned Milk 2L", sku: "amul_taaza_2l", prices: { blinkit: 115, zepto: 118, instamart: 116 }, inStock: { blinkit: true, zepto: true, instamart: true } },
    ],
  },
  {
    id: "milk_mother_dairy",
    baseVariant: "Mother Dairy",
    category: "Dairy",
    variants: [
      { name: "Mother Dairy Full Cream 500ml", sku: "md_full_500", prices: { blinkit: 34, zepto: 35, instamart: 34 }, inStock: { blinkit: true, zepto: true, instamart: false } },
      { name: "Mother Dairy Full Cream 1L", sku: "md_full_1l", prices: { blinkit: 68, zepto: 69, instamart: 68 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "Mother Dairy Full Cream 2L", sku: "md_full_2l", prices: { blinkit: 136, zepto: 137, instamart: 136 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "Mother Dairy Toned Milk 500ml", sku: "md_toned_500", prices: { blinkit: 30, zepto: 31, instamart: 30 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "Mother Dairy Toned Milk 1L", sku: "md_toned_1l", prices: { blinkit: 58, zepto: 59, instamart: 58 }, inStock: { blinkit: true, zepto: true, instamart: true } },
    ],
  },
  {
    id: "milk_gokul",
    baseVariant: "Gokul",
    category: "Dairy",
    variants: [
      { name: "Gokul Standardised Milk 500ml", sku: "gokul_std_500", prices: { blinkit: 33, zepto: 34, instamart: 33 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "Gokul Standardised Milk 1L", sku: "gokul_std_1l", prices: { blinkit: 66, zepto: 67, instamart: 66 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "Gokul Full Cream Milk 1L", sku: "gokul_full_1l", prices: { blinkit: 70, zepto: 72, instamart: 70 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "Gokul Full Cream Milk 2L", sku: "gokul_full_2l", prices: { blinkit: 140, zepto: 142, instamart: 140 }, inStock: { blinkit: false, zepto: true, instamart: true } },
    ],
  },

  // ── BREAD ──
  {
    id: "bread_britannia",
    baseVariant: "Britannia Bread",
    category: "Groceries",
    variants: [
      { name: "Britannia White Sandwich Bread 400g", sku: "brit_white_400", prices: { blinkit: 35, zepto: 35, instamart: 35 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "Britannia 100% Whole Wheat Brown Bread 400g", sku: "brit_brown_400", prices: { blinkit: 45, zepto: 45, instamart: 45 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "Britannia Multigrain Bread 400g", sku: "brit_multi_400", prices: { blinkit: 55, zepto: 56, instamart: 55 }, inStock: { blinkit: true, zepto: true, instamart: true } },
    ],
  },
  {
    id: "bread_harvest_gold",
    baseVariant: "Harvest Gold Bread",
    category: "Groceries",
    variants: [
      { name: "Harvest Gold White Bread 400g", sku: "hg_white_400", prices: { blinkit: 35, zepto: 35, instamart: 35 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "Harvest Gold Brown Bread 400g", sku: "hg_brown_400", prices: { blinkit: 45, zepto: 45, instamart: 45 }, inStock: { blinkit: true, zepto: false, instamart: true } },
      { name: "Harvest Gold Hearty Multigrain Bread 400g", sku: "hg_multi_400", prices: { blinkit: 50, zepto: 52, instamart: 50 }, inStock: { blinkit: true, zepto: true, instamart: true } },
    ],
  },
  {
    id: "bread_english_oven",
    baseVariant: "English Oven Bread",
    category: "Groceries",
    variants: [
      { name: "English Oven Sandwich White Bread 400g", sku: "eo_white_400", prices: { blinkit: 40, zepto: 40, instamart: 40 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "English Oven 100% Atta Brown Bread 400g", sku: "eo_brown_400", prices: { blinkit: 50, zepto: 50, instamart: 50 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "English Oven Multigrain Bread 400g", sku: "eo_multi_400", prices: { blinkit: 60, zepto: 62, instamart: 60 }, inStock: { blinkit: false, zepto: true, instamart: true } },
    ],
  },

  // ── EGGS ──
  {
    id: "eggs_farm_fresh",
    baseVariant: "Farm Fresh Eggs",
    category: "Dairy",
    variants: [
      { name: "White Farm Fresh Eggs 6 pcs", sku: "egg_white_6", prices: { blinkit: 45, zepto: 48, instamart: 46 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "White Farm Fresh Eggs 10 pcs", sku: "egg_white_10", prices: { blinkit: 75, zepto: 78, instamart: 76 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "White Farm Fresh Eggs 12 pcs", sku: "egg_white_12", prices: { blinkit: 85, zepto: 88, instamart: 86 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "White Farm Fresh Eggs 30 pcs", sku: "egg_white_30", prices: { blinkit: 205, zepto: 210, instamart: 208 }, inStock: { blinkit: true, zepto: false, instamart: true } },
    ],
  },
  {
    id: "eggs_country_delight",
    baseVariant: "Country Delight Eggs",
    category: "Dairy",
    variants: [
      { name: "Country Delight Protein White Eggs 6 pcs", sku: "cd_white_6", prices: { blinkit: 65, zepto: 68, instamart: 66 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "Country Delight Brown Eggs 6 pcs", sku: "cd_brown_6", prices: { blinkit: 85, zepto: 88, instamart: 86 }, inStock: { blinkit: true, zepto: true, instamart: true } },
    ],
  },
  {
    id: "eggs_nandini",
    baseVariant: "Nandini Eggs",
    category: "Dairy",
    variants: [
      { name: "Nandini Farm Fresh Eggs 6 pcs", sku: "nandini_6", prices: { blinkit: 40, zepto: 42, instamart: 41 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "Nandini Farm Fresh Eggs 30 pcs", sku: "nandini_30", prices: { blinkit: 195, zepto: 200, instamart: 198 }, inStock: { blinkit: false, zepto: true, instamart: true } },
    ],
  },

  // ── BUTTER ──
  {
    id: "butter_amul",
    baseVariant: "Amul Butter",
    category: "Dairy",
    variants: [
      { name: "Amul Pasteurized Salted Butter 100g", sku: "amul_butter_100", prices: { blinkit: 58, zepto: 60, instamart: 59 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "Amul Pasteurized Salted Butter 200g", sku: "amul_butter_200", prices: { blinkit: 115, zepto: 118, instamart: 116 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "Amul Pasteurized Salted Butter 500g", sku: "amul_butter_500", prices: { blinkit: 285, zepto: 290, instamart: 288 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "Amul Unsalted Butter 100g", sku: "amul_unsalted_100", prices: { blinkit: 60, zepto: 62, instamart: 61 }, inStock: { blinkit: true, zepto: false, instamart: true } },
      { name: "Amul Garlic & Herbs Butter 100g", sku: "amul_garlic_100", prices: { blinkit: 65, zepto: 68, instamart: 66 }, inStock: { blinkit: true, zepto: true, instamart: true } },
    ],
  },
  {
    id: "butter_mother_dairy",
    baseVariant: "Mother Dairy Butter",
    category: "Dairy",
    variants: [
      { name: "Mother Dairy Classic Salted Butter 100g", sku: "md_butter_100", prices: { blinkit: 56, zepto: 58, instamart: 57 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "Mother Dairy Classic Salted Butter 500g", sku: "md_butter_500", prices: { blinkit: 280, zepto: 285, instamart: 282 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "Mother Dairy White Unsalted Butter 100g", sku: "md_white_butter_100", prices: { blinkit: 58, zepto: 60, instamart: 59 }, inStock: { blinkit: false, zepto: true, instamart: true } },
    ],
  },
  {
    id: "butter_nandini",
    baseVariant: "Nandini Butter",
    category: "Dairy",
    variants: [
      { name: "Nandini Pasteurised Butter 100g", sku: "nandini_butter_100", prices: { blinkit: 54, zepto: 56, instamart: 55 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "Nandini Pasteurised Butter 500g", sku: "nandini_butter_500", prices: { blinkit: 270, zepto: 275, instamart: 272 }, inStock: { blinkit: true, zepto: true, instamart: false } },
    ],
  },

  // ── MISC ──
  {
    id: "paneer",
    baseVariant: "Paneer",
    category: "Dairy",
    variants: [
      { name: "Amul Malai Paneer 200g", sku: "paneer_200", prices: { blinkit: 90, zepto: 95, instamart: 92 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "Amul Malai Paneer 1kg", sku: "paneer_1kg", prices: { blinkit: 430, zepto: 440, instamart: 435 }, inStock: { blinkit: true, zepto: false, instamart: true } },
    ],
  },
  {
    id: "bananas",
    baseVariant: "Bananas",
    category: "Fruits",
    variants: [
      { name: "Fresh Robusta Bananas 6 pcs", sku: "banana_6", prices: { blinkit: 35, zepto: 38, instamart: 40 }, inStock: { blinkit: true, zepto: true, instamart: true } },
      { name: "Fresh Robusta Bananas 12 pcs", sku: "banana_12", prices: { blinkit: 65, zepto: 70, instamart: 75 }, inStock: { blinkit: true, zepto: true, instamart: false } },
    ],
  },
];

export { MERCHANTS, PRODUCTS };
