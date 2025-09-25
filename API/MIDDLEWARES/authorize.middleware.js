const jwt = require('jsonwebtoken');

const authorize = (...allowedRoles) => {
    return (req, res, next) => {

        const authHeader = req.headers['authorization']
        const accessToken = authHeader && authHeader.split(' ')[1]
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        
        

        if (!accessToken || !decoded.role) {
            return res.status(403).json({ message: "Accès refusé: aucun rôle détecté." })
        }

        const userRole = decoded.role

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message : "Accès refusé : rôle insuffisant" })
        }

        return next()

    }
}

module.exports = authorize