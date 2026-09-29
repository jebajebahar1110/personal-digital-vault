const express = require("express");
const { getAuth } = require("@clerk/express");

const supabase = require("../config/supabase");
const { encrypt, decrypt } = require("../services/encryptionService");

const router = express.Router();

// Get all credentials belonging to the logged-in user
router.get("/", async (req, res) => {
  try {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { data, error } = await supabase
      .from("credentials")
      .select(
        "id, user_id, title, username, website_url, notes, created_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to get credentials",
    });
  }
});

// Create a credential
router.post("/", async (req, res) => {
  try {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const {
      title,
      username,
      password,
      website_url,
      notes,
    } = req.body;

    if (!title || !username || !password) {
      return res.status(400).json({
        error: "Title, username and password are required",
      });
    }

    // Encrypt password before storing it
    const encrypted = encrypt(password);

    const { data, error } = await supabase
      .from("credentials")
      .insert([
        {
          user_id: userId,
          title: title,
          username: username,
          password_encrypted: encrypted.encryptedData,
          iv: encrypted.iv,
          auth_tag: encrypted.authTag,
          website_url: website_url || null,
          notes: notes || null,
        },
      ])
      .select(
        "id, user_id, title, username, website_url, notes, created_at"
      )
      .single();

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create credential",
    });
  }
});

// Get one credential without revealing the password
router.get("/:id", async (req, res) => {
  try {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { data, error } = await supabase
      .from("credentials")
      .select(
        "id, user_id, title, username, website_url, notes, created_at"
      )
      .eq("id", req.params.id)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        error: "Credential not found",
      });
    }

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to get credential",
    });
  }
});

// Get decrypted password for the credential owner
router.get("/:id/password", async (req, res) => {
  try {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { data, error } = await supabase
      .from("credentials")
      .select(
        "id, password_encrypted, iv, auth_tag"
      )
      .eq("id", req.params.id)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        error: "Credential not found",
      });
    }

    const password = decrypt(
      data.password_encrypted,
      data.iv,
      data.auth_tag
    );

    res.json({
      password,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to decrypt credential password",
    });
  }
});

// Update a credential
router.put("/:id", async (req, res) => {
  try {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const {
      title,
      username,
      password,
      website_url,
      notes,
    } = req.body;

    if (!title || !username) {
      return res.status(400).json({
        error: "Title and username are required",
      });
    }

    const updateData = {
      title,
      username,
      website_url: website_url || null,
      notes: notes || null,
    };

    // Only encrypt a new password if one was provided
    if (password) {
      const encrypted = encrypt(password);

      updateData.password_encrypted = encrypted.encryptedData;
      updateData.iv = encrypted.iv;
      updateData.auth_tag = encrypted.authTag;
    }

    const { data, error } = await supabase
      .from("credentials")
      .update(updateData)
      .eq("id", req.params.id)
      .eq("user_id", userId)
      .select(
        "id, user_id, title, username, website_url, notes, created_at"
      )
      .single();

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update credential",
    });
  }
});

// Delete a credential
router.delete("/:id", async (req, res) => {
  try {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { error } = await supabase
      .from("credentials")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", userId);

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.json({
      message: "Credential deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to delete credential",
    });
  }
});

module.exports = router;