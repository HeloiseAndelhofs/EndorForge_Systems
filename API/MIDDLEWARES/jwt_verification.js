const jwt = require('jsonwebtoken');

const jwtVerification = (req, res, next) => {
    const { JWT_SECRET } = process.env;
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Aucun token détecté, connectez-vous." });
    }

    jwt.verify(token, JWT_SECRET, (err, payload) => {

        // Cas : Token invalide (erreur présente et différente de expiration)
        if (err) {
            console.log("JWT verify error:", err);

            if (err.name === "TokenExpiredError") {
                res.clearCookie('token');
                return res.status(401).json({ message: "Token expiré, veuillez vous reconnecter." });
            }

            return res.status(498).json({ message: "Token invalide ou corrompu." });
        }

        // Cas : tout est bon, on ajoute les infos à la requête
        req.payload = payload;
        next();
    });
};

module.exports = jwtVerification;
