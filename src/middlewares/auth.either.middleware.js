import { userverifyJWT } from "./auth.user.middleware.js";
import { ventureVentureverifyJWT } from "./auth.venture.middleware.js";

export const eitherAuth = (req, res, next) => {
    userverifyJWT(req, res, (err) => {
        if (!err) {
            return next(); // ✅ User token passed
        }

        ventureVentureverifyJWT(req, res, (err2) => {
            if (!err2) {
                return next(); // ✅ Venture token passed
            }

            // ❌ Both failed
            return res.status(401).json({
                message: "Unauthorized (User or Venture token required)",
            });
        });
    });
};
