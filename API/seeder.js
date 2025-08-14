// API/seeder.js

import mongoose from 'mongoose';
import 'dotenv/config'; // Ensures .env variables are loaded

// Import your Mongoose models
import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';

const initialProducts = [
  {
    name: "Handwoven Basket",
    description: "Beautiful handmade basket from local reeds",
    price: 45.99,
    category: "Home Decor",
    artisan: "Amir Khan",
    images: ["/img/1.png"], // Changed from imageUrl to match your schema
    quantity: 10
  },
  {
    name: "Ceramic Mug",
    description: "Artisan ceramic mug with unique glaze",
    price: 25.50,
    category: "Kitchenware",
    artisan: "Adam Smith",
    images: ["/img/2.png"],
    quantity: 15
  },
  {
    name: "Macrame Wall Hanging",
    description: "Boho-style macrame for home décor",
    price: 35.00,
    category: "Home Decor",
    artisan: "Leena Roy",
    images: ["/img/3.png"],
    quantity: 8
  },
  {
    name: "Hand-painted Journal",
    description: "Eco-friendly journal with unique painted cover",
    price: 18.75,
    category: "Stationery",
    artisan: "Sonia Patel",
    images: ["/img/4.png"],
    quantity: 20
  },
  {
    name: "Wooden Toy Train",
    description: "Safe and natural wooden toy for kids",
    price: 29.99,
    category: "Toys",
    artisan: "Ravi Mehra",
    images: ["/img/5.png"],
    quantity: 12
  },
  {
    name: "Beaded Necklace",
    description: "Handcrafted necklace made with glass beads",
    price: 22.00,
    category: "Jewelry",
    artisan: "Nadia Ali",
    images: ["/img/6.png"],
    quantity: 25
  },
  {
    name: "Hand-dyed Scarf",
    description: "Silk scarf dyed with natural plant pigments",
    price: 38.50,
    category: "Fashion",
    artisan: "Jaya Kapoor",
    images: ["/img/7.png"],
    quantity: 7
  },
  {
    name: "Terracotta Planter",
    description: "Earthy terracotta planter perfect for indoor plants",
    price: 16.00,
    category: "Garden",
    artisan: "Imran Hussain",
    images: ["/img/8.png"],
    quantity: 18
  }
];

const seedDatabase = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    // 2. Clear existing data
    await Product.deleteMany({});
    console.log('Existing products cleared.');

    // 3. Prepare artisans and categories
    const artisanMap = new Map();
    const categoryMap = new Map();

    for (const product of initialProducts) {
      // Find or create artisan
      if (!artisanMap.has(product.artisan)) {
        let artisan = await User.findOne({ name: product.artisan, role: 'ARTISAN' });
        if (!artisan) {
          artisan = await User.create({
            name: product.artisan,
            email: `${product.artisan.toLowerCase().replace(' ', '')}@example.com`,
            password: 'password123', // Default password
            role: 'ARTISAN'
          });
        }
        artisanMap.set(product.artisan, artisan._id);
      }
      // Find or create category
      if (!categoryMap.has(product.category)) {
        let category = await Category.findOne({ name: product.category });
        if (!category) {
          category = await Category.create({ name: product.category });
        }
        categoryMap.set(product.category, category._id);
      }
    }

    // 4. Transform product data with correct ObjectIDs
    const productsToCreate = initialProducts.map(product => ({
      ...product,
      artisan: artisanMap.get(product.artisan),
      category: categoryMap.get(product.category)
    }));
    
    // 5. Insert the new products
    await Product.insertMany(productsToCreate);
    console.log('Database has been successfully seeded!');

  } catch (error) {
    console.error('Error while seeding database:', error);
  } finally {
    // 6. Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

seedDatabase();