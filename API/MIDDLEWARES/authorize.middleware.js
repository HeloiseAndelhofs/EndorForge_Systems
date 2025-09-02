module.exports = (...allowedRoles) => {
    (req, res, next) => {

        if (!req.payload || ! req.payload.role) {
            return res.status(403).json({ message: "Accès refusé: aucun rôle détecté." })
        }

        const userRole = req.payload.role

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message : "Accès refusé : rôle insuffisant" })
        }

        return next()

    }
}