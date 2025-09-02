// auth.service.js
// SERVICE POUR LA GESTION DES TOKENS
// ----------------------------

const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_REFRESH_SECRET } = process.env;
const sql = require('mssql')
const sqlConfig = require('../configs/sql.config')


const authService = {

    createAccessToken: async (user) => {
        console.log("AUTH SERVICE HELLO");
        
        console.log(user);
        
        const accessToken =  jwt.sign({
            id: user.user_id,
            role: user.user_role,
            team: user.team_name,
            ou: user.team_ou,
            email: user.user_email,
            username: `uid=${user.user_name},ou=${user.team_ou},dc=endor-forge,dc=local`
        }, JWT_SECRET, { expiresIn: '15m' });

        return accessToken

    },

    createRefreshToken: async (user) => {
        
        const refreshToken = jwt.sign({ id: user.user_id, email: user.user_email }, JWT_REFRESH_SECRET, { expiresIn: '14d' });

        await sql.connect(sqlConfig)
        await new sql.Request()
                .input("userID", sql.Int, user.user_id)
                .input("token", sql.NVarChar, refreshToken)
                .query(`UPDATE USERS 
                        SET user_refresh_token = @token, user_updatedAt = GETDATE()
                        WHERE user_id = @userID `)

        return refreshToken
    }
};

module.exports = authService;