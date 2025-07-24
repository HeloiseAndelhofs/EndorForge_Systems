// auth.service.js
// SERVICE POUR LA GESTION DES TOKENS
// ----------------------------

const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_REFRESH_SECRET } = process.env;

const authService = {

    createAccessToken: (user) => {

        return jwt.sign({
            id: user.user_id,
            role: user.user_role,
            team: user.team_name,
            ou: user.team_ou,
            email: user.user_email,
            username: `uid=${user.user_name},ou=${user.team_ou},dc=endor-forge,dc=local`
        }, JWT_SECRET, { expiresIn: '15m' });

    },

    createRefreshToken: (user) => {
        
        return jwt.sign({ id: user.user_id }, JWT_REFRESH_SECRET, { expiresIn: '14d' });
    }
};

module.exports = authService;