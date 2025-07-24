const jwt = require('jsonwebtoken');
const userService = require('../SERVICES/user.service');

const refreshToken = async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;

    // Pas de refresh token présent
    if (!refreshToken) {
        return res.status(401).json({ message: "Aucun refresh token trouvé, veuillez vous reconnecter." });
    }

    try {
        // Vérifie que le refresh token est valide
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Optionnel : tu peux aussi re-vérifier que l’utilisateur existe toujours
        const user = await userService.getUserById(decoded.id);
        if (!user) {
            return res.status(403).json({ message: "Utilisateur non trouvé pour ce token." });
        }

        // Si tout est bon, on ajoute les infos à la req pour que le controller les utilise
        req.user = user;
        req.payload = { id: decoded.id };
        next(); // Prochain middleware ou controller appelé

    } catch (err) {
        console.error(err);
        return res.status(403).json({ message: "Refresh token invalide ou expiré, veuillez vous reconnecter." });
    }
};

module.exports = refreshToken;
