// MIDDLEWARES/auth.js
const jwt = require('jsonwebtoken');
const utilityFunctions = require('../SERVICES/utilityFuncUsers.service');

const auth = async (req, res, next) => {

    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken) {
        return res.status(401).json({ message: "Aucun token détecté, veuillez vous reconnecter." });
    }

    try {
        console.log("C'EST LE MIDDLEWARE AUTH, ON EST DANS LA PARTIE TOUS LES TOKENS SONT BONS");

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

        if (decoded) {
            req.payload = decoded;
            return next();
        }

    } catch (err) {

        if (err.name === "TokenExpiredError") {
            console.log("C'EST LE MIDDLEWARE AUTH, ON EST DANS LA PARTIE ERR TOKEN EXPIRED");
            
            if (!refreshToken) {
                console.log("MIDDLEWARE, PAS DE TOKEN");
                
                return res.status(401).json({ message: "Token expiré et aucun refreshToken, veuillez vous reconnecter." });
            }

            try {
                console.log("MIDDLEWARE, CREATION D'UN NOUVEAU ACCESS TOKEN");
                
                const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                console.log(decodedRefresh);
                
                const user = await utilityFunctions.getUser(decodedRefresh.email);
                
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
