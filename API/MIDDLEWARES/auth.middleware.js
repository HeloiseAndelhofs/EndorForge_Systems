// MIDDLEWARES/auth.js
const jwt = require('jsonwebtoken');
const userService = require('../SERVICES/user.service');
const utilityFunctions = require('../SERVICES/utilityFuncUsers.service');

const auth = async (req, res, next) => {

    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken) {
        return res.status(401).json({ message: "Aucun token détecté, veuillez vous reconnecter." });
    }

    try {

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        req.payload = decoded;
        return next();

    } catch (err) {

        if (err.name === "TokenExpiredError") {
            if (!refreshToken) {
                return res.status(401).json({ message: "Token expiré et aucun refreshToken, veuillez vous reconnecter." });
            }

            try {

                const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

                const user = await userService.getUserById(decodedRefresh.id);

                if (!user) {
                    return res.status(403).json({ message: "Utilisateur non trouvé." });
                }

                // Nouveau access token
                const newAccessToken = utilityFunctions.newToken(user);

                res.cookie("accessToken", newAccessToken);

                req.payload = jwt.decode(newAccessToken);
                return next();

            } catch (refreshErr) {
                console.error("Erreur lors du refresh :", refreshErr);
                return res.status(403).json({ message: "Refresh token invalide ou expiré." });
            }
        }

        console.error("Erreur JWT :", err);
        return res.status(403).json({ message: "Token invalide." });
    }
};

module.exports = auth;
