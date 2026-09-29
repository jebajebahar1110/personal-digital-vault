const supabase = require("../config/supabase");
const { getAuth } = require("@clerk/express");

const ensureProfile = async (req, res, next) => {
  try {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    // Check whether the user already has a profile
    const { data: existingProfile, error: findError } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("id", userId)
      .maybeSingle();

    if (findError) {
      console.error(findError);

      return res.status(500).json({
        error: "Failed to check user profile",
      });
    }

    // Profile already exists
    if (existingProfile) {
      req.userProfile = existingProfile;
      return next();
    }

    // Create a basic profile for the authenticated Clerk user
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert([
        {
          id: userId,
          role: "USER",
        },
      ])
      .select("id, full_name, email, role")
      .single();

    if (createError) {
      console.error(createError);

      return res.status(500).json({
        error: "Failed to create user profile",
      });
    }

    req.userProfile = newProfile;

    next();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to ensure user profile",
    });
  }
};

module.exports = ensureProfile;