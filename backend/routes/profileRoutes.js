const express = require("express");
const { getAuth } = require("@clerk/express");

const supabase = require("../config/supabase");

const router = express.Router();

// Get the logged-in user's profile
router.get("/", async (req, res) => {
  try {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        error: "Profile not found",
      });
    }

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to get profile",
    });
  }
});

module.exports = router;