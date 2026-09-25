require("dotenv").config();

const express = require("express");
const { clerkMiddleware, getAuth } = require("@clerk/express");

const app = express();

app.use(express.json());
app.use(clerkMiddleware());

const PORT = process.env.PORT || 5000;

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});