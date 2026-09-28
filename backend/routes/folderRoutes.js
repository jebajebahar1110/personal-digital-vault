const express = require("express");
const { getAuth } = require("@clerk/express");
const supabase = require("../config/supabase");

const router = express.Router();

// Get all folders
router.get("/", async (req, res) => {
  try {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "Failed to get folders",
    });
  }
});

// Create a folder
router.post("/", async (req, res) => {
  try {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "Folder name is required",
      });
    }

    const { data, error } = await supabase
      .from("folders")
      .insert([
        {
          user_id: userId,
          name: name,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Failed to create folder",
    });
  }
});

// Update a folder
router.put("/:id", async (req, res) => {
  try {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "Folder name is required",
      });
    }

    const { data, error } = await supabase
      .from("folders")
      .update({
        name: name,
      })
      .eq("id", req.params.id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "Failed to update folder",
    });
  }
});

// Delete a folder
router.delete("/:id", async (req, res) => {
  try {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { error } = await supabase
      .from("folders")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", userId);

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.json({
      message: "Folder deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete folder",
    });
  }
});

module.exports = router;