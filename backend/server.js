require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { clerkMiddleware, getAuth } = require("@clerk/express");

const folderRoutes = require("./routes/folderRoutes");
const documentRoutes = require("./routes/documentRoutes");
const credentialRoutes = require("./routes/credentialRoutes");
const ensureProfile = require("./middleware/profileMiddleware");
const profileRoutes = require("./routes/profileRoutes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());
app.use(clerkMiddleware());
app.use(ensureProfile);

app.use("/api/folders", folderRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/credentials", credentialRoutes);

// Profile APIs
app.use("/api/profile", profileRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("Personal Digital Vault Backend is running");
});

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