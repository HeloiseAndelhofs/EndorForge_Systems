const sql = require('mssql');
const sqlConfig = require('../configs/sql.config.js');
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = process.env

const utilityFunctions = {

    getUser: async(email) => {
        try {
            
            await sql.connect(sqlConfig)
            const req = new sql.Request()
    
            const result = await req
                        .input('email', sql.NVarChar, email)
                        .query(`SELECT u.*, t.*
                                 FROM users u 
                                 JOIN teams t ON u.FK_team_id = t.team_id
                                 WHERE u.user_email = @email`)


            console.log('RESULT : ' + JSON.stringify(result.recordset[0]));
            console.log("LENGHT RECORDSET : " + result.recordset.length);
            
            

            //Si le résultat est plus petit ou égal à 0 => aucun utilisateur trouvé donc retourne faux
            if (result.recordset.length <= 0) {
                console.warn(`L'utilisateur avec l'email : ${email}, n'a pas été retrouvé dans la base de donnée`);
                return false
            }

            return result.recordset[0]
    
        } catch (err) {
            console.error('UTILITY SERVICE, getUser : ' + err);
            throw new Error(err.message)
        }
    },

    newToken: (user) => {

        try {
            const accessToken = jwt.sign({
                id: user.user_id,
                role: user.user_role,
                team: user.team_name,
                ou: user.team_ou,
                email: user.user_email,
                username: `uid=${user.user_name},ou=${user.team_ou},dc=endor-forge,dc=local`
            }, JWT_SECRET, { expiresIn: '15m' })

            return accessToken

        } catch (err) {
            console.error(err + " : ERREUR NEW TOKEN, UTILITY SERVICE");
            throw new Error(err.message)
        }

    }


}


module.exports = utilityFunctions
