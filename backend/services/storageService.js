const supabase = require("../config/supabase");

const uploadFile = async (filePath, fileBuffer, contentType) => {
  const { data, error } = await supabase.storage
    .from("documents")
    .upload(filePath, fileBuffer, {
      contentType: contentType,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return data;
};

const createSignedUrl = async (filePath) => {
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(filePath, 60 * 5);

  if (error) {
    throw error;
  }

  return data;
};


const deleteFile = async (filePath) => {
  const { data, error } = await supabase.storage
    .from("documents")
    .remove([filePath]);

  if (error) {
    throw error;
  }

  return data;
};

module.exports = {
  uploadFile,
  createSignedUrl,
  deleteFile,
};