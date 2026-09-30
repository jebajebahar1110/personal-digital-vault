require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { clerkMiddleware, getAuth } = require("@clerk/express");

const folderRoutes = require("./routes/folderRoutes");
const documentRoutes = require("./routes/documentRoutes");
const credentialRoutes = require("./routes/credentialRoutes");
const profileRoutes = require("./routes/profileRoutes");

const ensureProfile = require("./middleware/profileMiddleware");
const { requireRole } = require("./middleware/roleMiddleware");

const app = express();

<<<<<<< HEAD
// Allow frontend to communicate with backend
=======
>>>>>>> feature/frontend-setup
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

<<<<<<< HEAD
// Read JSON request bodies
=======
>>>>>>> feature/frontend-setup
app.use(express.json());
app.use(clerkMiddleware());
app.use(ensureProfile);

<<<<<<< HEAD
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

// Profile APIs
app.use("/api/profile", profileRoutes);

=======
app.use("/api/folders", folderRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/credentials", credentialRoutes);

// Profile APIs
app.use("/api/profile", profileRoutes);

>>>>>>> feature/frontend-setup
// Admin test route
app.get(
  "/api/admin-test",
  requireRole("ADMIN", "SUPER_ADMIN"),
  (req, res) => {
    res.json({
      message: "Admin access granted",
      role: req.userRole,
    });
  }
);

// Home route
app.get("/", (req, res) => {
  res.send("Personal Digital Vault Backend is running");
});

<<<<<<< HEAD
// Authentication test route
=======
>>>>>>> feature/frontend-setup
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