require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { clerkMiddleware, getAuth } = require("@clerk/express");

const folderRoutes = require("./routes/folderRoutes");
const documentRoutes = require("./routes/documentRoutes");
const credentialRoutes = require("./routes/credentialRoutes");
const ensureProfile = require("./middleware/profileMiddleware");

const app = express();

// Allow frontend to communicate with backend
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// Read JSON request bodies
app.use(express.json());

// Clerk authentication middleware
app.use(clerkMiddleware());

// Create/check Supabase profile for authenticated users
app.use(ensureProfile);

// Folder APIs
app.use("/api/folders", folderRoutes);

// Document APIs
app.use("/api/documents", documentRoutes);

// Credential APIs
app.use("/api/credentials", credentialRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("Personal Digital Vault Backend is running");
});

// Authentication test route
app.get("/api/auth-test", (req, res) => {
  const { isAuthenticated, userId } = getAuth(req);

  if (!isAuthenticated) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  res.json({
    message: "Authentication successful",
    userId,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});