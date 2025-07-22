const jwt = require('jsonwebtoken')

const jwtVerification = (req, res, next) => {

    //recupere le secret
    const { JWT_SECRET } = process.env
    //recupere le token dans les cookies
    const token = req.cookies.token

    //si pas de token, demande rejeté car "unauthorized"
    if (!token) {
        return res.status(401).json({ message : "Aucun token détecté, connectez vous pour avoir accès à cette ressource." })
    } else {
        //si token trouvé, on vérifie sa validité
        jwt.verify(token, JWT_SECRET, (error, payload) => {
            //si erreur qui n'est pas "token expiré", demande rejetée car erreur dans le token
            if (error & error.name !== "TokenExpiredError") {
                return res.status(498).json({ message: "Token invalide, erreur lors de la récupération du token" })
            }
            //si erreur "token expired", deamnde rejetée et indqiue à l'utilisateur de se reconnecter
            else if (error & error.name === "TokenExpiredError") {
                return res.status(498).json({ message : "Token expiré, veuillez vous reconnecter." })
            }
            //si token, ajoute le payload à la requete et passe à l'action suivante
            else if (token) {
                req.payload = payload
                next()
            }

        })
    }
}

module.exports = jwtVerification