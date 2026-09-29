const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const { getAuth } = require("@clerk/express");

const supabase = require("../config/supabase");

const {
  uploadFile,
  createSignedUrl,
  deleteFile,
} = require("../services/storageService");

const router = express.Router();

// Store uploaded files temporarily in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

// Get all documents belonging to the logged-in user
router.get("/", async (req, res) => {
  try {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { data, error } = await supabase
      .from("documents")
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
    console.error(error);

    res.status(500).json({
      error: "Failed to get documents",
    });
  }
});

// Upload a document
router.post("/", upload.single("file"), async (req, res) => {
  let uploadedFilePath = null;

  try {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "File is required",
      });
    }

    const { folderId } = req.body;

    // If a folder is selected, make sure it belongs to the logged-in user
    if (folderId) {
      const { data: folder, error: folderError } = await supabase
        .from("folders")
        .select("id")
        .eq("id", folderId)
        .eq("user_id", userId)
        .single();

      if (folderError || !folder) {
        return res.status(403).json({
          error: "Invalid folder",
        });
      }
    }

    // Generate a unique file name
    const fileId = crypto.randomUUID();

    const safeFileName = req.file.originalname.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

    const filePath = `${userId}/${fileId}-${safeFileName}`;

    uploadedFilePath = filePath;

    // Upload actual file to Supabase Storage
    await uploadFile(
      filePath,
      req.file.buffer,
      req.file.mimetype
    );

    // Save file information in database
    const { data, error } = await supabase
      .from("documents")
      .insert([
        {
          user_id: userId,
          folder_id: folderId || null,
          name: req.file.originalname,
          storage_path: filePath,
          file_type: req.file.mimetype,
          file_size: req.file.size,
        },
      ])
      .select()
      .single();

    if (error) {
      // If database insert fails, remove uploaded file
      await deleteFile(filePath);

      return res.status(500).json({
        error: error.message,
      });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error(error);

    // Cleanup uploaded file if something failed
    if (uploadedFilePath) {
      try {
        await deleteFile(uploadedFilePath);
      } catch (deleteError) {
        console.error("Failed to cleanup uploaded file:", deleteError);
      }
    }

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File size cannot exceed 10 MB",
      });
    }

    res.status(500).json({
      error: "Failed to upload document",
    });
  }
});

// Get a temporary signed URL for viewing/downloading a document
router.get("/:id/url", async (req, res) => {
  try {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { data: document, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", req.params.id)
      .eq("user_id", userId)
      .single();

    if (error || !document) {
      return res.status(404).json({
        error: "Document not found",
      });
    }

    const signedUrlData = await createSignedUrl(
      document.storage_path
    );

    res.json({
      url: signedUrlData.signedUrl,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create document URL",
    });
  }
});

// Delete a document
router.delete("/:id", async (req, res) => {
  try {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    // Get document only if it belongs to the logged-in user
    const { data: document, error: findError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", req.params.id)
      .eq("user_id", userId)
      .single();

    if (findError || !document) {
      return res.status(404).json({
        error: "Document not found",
      });
    }

    // Delete actual file from Storage
    await deleteFile(document.storage_path);

    // Delete metadata from database
    const { error: deleteError } = await supabase
      .from("documents")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", userId);

    if (deleteError) {
      return res.status(500).json({
        error: deleteError.message,
      });
    }

    res.json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to delete document",
    });
  }
});

module.exports = router;