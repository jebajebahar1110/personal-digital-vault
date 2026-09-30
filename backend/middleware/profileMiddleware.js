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

    const clerkUser = await clerkClient.users.getUser(userId);

    const fullName = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(" ");

    const email =
      clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId
      )?.emailAddress || null;

    const { data: existingProfile, error: findError } = await supabase
      .from("profiles")
      .select(
        "id, full_name, email, role, trial_start_date, trial_end_date, subscription_status"
      )
      .eq("id", userId)
      .maybeSingle();

    if (findError) {
      console.error(findError);
      return res.status(500).json({
        error: "Failed to check user profile",
      });
    }

    // Existing profile
    if (existingProfile) {
      const updateData = {};

      if (!existingProfile.full_name && fullName) {
        updateData.full_name = fullName;
      }

      if (!existingProfile.email && email) {
        updateData.email = email;
      }

      // Initialize trial dates if this is a TRIAL user
      // but trial dates are missing.
      if (
        existingProfile.subscription_status === "TRIAL" &&
        (!existingProfile.trial_start_date ||
          !existingProfile.trial_end_date)
      ) {
        const trialStartDate = new Date();
        const trialEndDate = new Date();

        trialEndDate.setDate(trialEndDate.getDate() + 7);

        updateData.trial_start_date = trialStartDate.toISOString();
        updateData.trial_end_date = trialEndDate.toISOString();
        updateData.subscription_status = "TRIAL";
      }

      if (Object.keys(updateData).length > 0) {
        const { data: updatedProfile, error: updateError } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", userId)
          .select(
            "id, full_name, email, role, trial_start_date, trial_end_date, subscription_status"
          )
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

    // New profile → automatically create 7-day trial
    const trialStartDate = new Date();
    const trialEndDate = new Date();

    trialEndDate.setDate(trialEndDate.getDate() + 7);

    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert([
        {
          id: userId,
          full_name: fullName || null,
          email: email || null,
          role: "USER",
          trial_start_date: trialStartDate.toISOString(),
          trial_end_date: trialEndDate.toISOString(),
          subscription_status: "TRIAL",
        },
      ])
      .select(
        "id, full_name, email, role, trial_start_date, trial_end_date, subscription_status"
      )
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