// MIDDLEWARES/auth.js
const jwt = require('jsonwebtoken');
const authService = require('../SERVICES/auth.service')
const refreshTokenService = require('../SERVICES/refreshToken.service');

const auth = async (req, res, next) => {

    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken) {
        return res.status(401).json({ message: "Aucun token détecté, veuillez vous reconnecter." });
    }

    try {
        
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        console.log("C'EST LE MIDDLEWARE AUTH, ON EST DANS LA PARTIE TOUS LES TOKENS SONT BONS");

        if (decoded) {
            req.payload = decoded;
            return next();
        }

    } catch (err) {

        if (err.name !== "TokenExpiredError") {
            console.error("Erreur JWT :", err);
            return res.status(401).json({message : "Token invalide."})
        }

        //Access token expiré ==> on tente un refresh
        if (err.name === "TokenExpiredError") {
            console.log("C'EST LE MIDDLEWARE AUTH, ON EST DANS LA PARTIE ERR TOKEN EXPIRED");
            
            if (!refreshToken) {
                console.log("MIDDLEWARE, PAS DE TOKEN");
                
                return res.status(401).json({ message: "Token expiré et aucun refreshToken, veuillez vous reconnecter." });
            }

            try {
                console.log("MIDDLEWARE, CREATION D'UN NOUVEAU ACCESS TOKEN");

                const userFromDB = await refreshTokenService.find(refreshToken)

                if (!userFromDB) {
                    return res.status(404).json({ message: "Refresh token invalide." })
                }

                const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                console.log(decodedRefresh);

                if (!decodedRefresh) {
                    return res.status(401).json({ message: "Refresh Token expiré ou non valable." })
                }
                
                // Nouveau access token
                const newAccessToken = authService.createAccessToken(userFromDB)

                res.cookie("accessToken", newAccessToken);

                req.payload = jwt.decode(newAccessToken);
                return next();

            } catch (refreshErr) {
                console.error("Erreur lors du refresh :", refreshErr);
                return res.status(403).json({ message: "Refresh token invalide ou expiré." });
            }
        }
    }
};

module.exports = auth;
