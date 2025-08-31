const sql = require("mssql")
const sqlConfig = require("../configs/sql.config")

const refreshToken = {

    save: async (userID, token) => {

        try {
            
            await sql.connect(sqlConfig)
            await new sql.Request()
                    .input("userID", sql.Int, userID)
                    .input("token", sql.NVarChar, token)
                    .query(`
                            UPDATE USERS
                            SET user_refresh_token = @token, user_updated£_at = GETDATE()
                            WHERE user_id = @userID
                        `)

        } catch (err) {
            console.error(err + " : ERREUR DANS LE SERVICE REFRESH TOKEN SAVE");
            throw new Error(err)
        }

    },

    find: async (token) => {

        try {
            
            await sql.connect(sqlConfig)
            const result = new sql.Request()
            await result
                .input("token", sql.NVarChar, token)
                .query(`
                    SELECT * FROM USERS
                    WHERE user_refresh_token = @token
                    `)

            if (!result.recordset[0]) {
                throw new Error("ERREUR LORS DE LA RÉCUPERATION DU USER AVEC LE TOKEN DANS LE REFRESH TOKEN SERVICE.")
            }

            return result.recordset[0]

        } catch (err) {
            console.error(err + " : ERREUR DANS LE SERVICE REFRESH TOKEN FIND");
            throw new Error(err)
        }

    },

    revoke: async (token) => {

        try {
            
            await sql.connect(sqlConfig)
            await new sql.Request()
                .input("token", sql.NVarChar, token)
                .query(`
                    UPDATE USERS
                    SET user_refresh_token = NULL
                    WHERE user_refresh_token = @token
                    `)

        } catch (err) {
            
        }

    }

}

module.exports = refreshToken