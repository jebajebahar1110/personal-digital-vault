const supabase = require("../config/supabase");
const { getAuth, clerkClient } = require("@clerk/express");

const ensureProfile = async (req, res, next) => {
  try {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    // Get user details from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);

    const fullName = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(" ");

    const email =
      clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId
      )?.emailAddress || null;

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
      const updateData = {};

      // Add Clerk full name if it is missing in Supabase
      if (!existingProfile.full_name && fullName) {
        updateData.full_name = fullName;
      }

      // Add Clerk email if it is missing in Supabase
      if (!existingProfile.email && email) {
        updateData.email = email;
      }

      // Update profile only when there is missing information
      if (Object.keys(updateData).length > 0) {
        const { data: updatedProfile, error: updateError } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", userId)
          .select("id, full_name, email, role")
          .single();

        if (updateError) {
          console.error(updateError);

          return res.status(500).json({
            error: "Failed to update user profile",
          });
        }

        req.userProfile = updatedProfile;
      } else {
        req.userProfile = existingProfile;
      }

      return next();
    }

    // Create a profile for a new authenticated Clerk user
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert([
        {
          id: userId,
          full_name: fullName || null,
          email: email || null,
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