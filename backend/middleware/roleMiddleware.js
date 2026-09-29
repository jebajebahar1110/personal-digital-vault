const supabase = require("../config/supabase");
const { getAuth } = require("@clerk/express");

// Check whether the logged-in user has one of the allowed roles
const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const { isAuthenticated, userId } = getAuth(req);

      if (!isAuthenticated) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error || !profile) {
        return res.status(403).json({
          error: "User profile not found",
        });
      }

      if (!allowedRoles.includes(profile.role)) {
        return res.status(403).json({
          error: "Access denied",
        });
      }

      req.userRole = profile.role;

      next();
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to verify user role",
      });
    }
  };
};

module.exports = {
  requireRole,
};