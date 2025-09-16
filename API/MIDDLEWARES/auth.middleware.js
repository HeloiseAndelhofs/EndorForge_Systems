// MIDDLEWARES/auth.js
const jwt = require('jsonwebtoken');
const authService = require('../SERVICES/auth.service')
const refreshTokenService = require('../SERVICES/refreshToken.service');

const auth = async (req, res, next) => {
        
        const authHeader = req.headers['authorization']
        const accessToken = authHeader && authHeader.split(' ')[1]

    if (!accessToken) {
        return res.status(401).json({ message: "Aucun token détecté, veuillez vous connecter." });
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
            
            try {
                console.log("MIDDLEWARE, CREATION D'UN NOUVEAU ACCESS TOKEN");

                if (err.name === "TokenExpiredError") {
                    return res.status(401).json({ message : "Token expiré, veuillez vous reconnecter." })
                }

            } catch (refreshErr) {
                console.error("Erreur lors du refresh :", refreshErr);
                return res.status(403).json({ message: "Refresh token invalide ou expiré." });
            }
        }
    }
};

module.exports = auth;
