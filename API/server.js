import "dotenv/config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import mongoose from "mongoose";
import typeDefs from "./graphql/schemas/index.js";
import resolvers from "./graphql/resolvers/index.js";
import { verifyToken } from "./utils/auth.js";
import fs from "fs";
import path from "path";
import multer from "multer";
import cors from "cors";

// Verify environment variables are loaded
console.log("MONGODB_URI:", process.env.MONGODB_URI);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "***" : "Not set");

async function startServer() {
  const app = express();
  app.use(
    cors({
      origin: ['http://localhost:3999', 'https://studio.apollographql.com'], // frontend URL
      credentials: true,
    })
  );
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), "API", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Multer setup for file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
  });
  const upload = multer({ storage });

  // Serve uploads directory as static files
  app.use("/uploads", express.static(uploadsDir));

  // Image upload endpoint
  app.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // Return the URL to access the uploaded image
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  // Database Connection with error handling
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }

  // Apollo Server setup
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || "";
      const user = verifyToken(token.replace("Bearer ", ""));
      return { user };
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(
      `🚀 Server running at http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

startServer().catch((err) => {
  console.error("Server startup error:", err);
  process.exit(1);
});
