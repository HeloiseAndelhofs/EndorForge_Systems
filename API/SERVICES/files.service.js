const sqlConfig = require('../configs/sql.config')
const sql = require('mssql')
const utilitFunc = require('../SERVICES/utilityFuncUsers.service')

const filesService = {

    putFileDB: async(filename, file_path, userID, visibility, roleRequired, file_type, file_size, teamId, description) => {
        try {
            
            await sql.connect(sqlConfig);
            const request = new sql.Request();
            await request
                .input('filename', sql.VarChar, filename)
                .input('file_path', sql.VarChar, file_path)
                .input('userId', sql.Int, userID)
                .input('visibility', sql.VarChar, visibility)
                .input('roleRequired', sql.VarChar, roleRequired)
                .input('file_type', sql.VarChar, file_type)
                .input('file_size', sql.Int, file_size)
                .input('teamId', sql.Int, teamId)
                .input('description', sql.VarChar, description)
                .query(`
                    INSERT INTO FILES (file_name, file_path, FK_user_id, file_uploadedAt, file_visibility, file_roleRequired, file_type, file_size, FK_team_id, file_description)
                    VALUES (@filename, @file_path, @userId, GETDATE(), @visibility, @roleRequired, @file_type, @file_size, @teamId, @description)
                `)

            return

        } catch (err) {
            console.error("Erreur serveur lors de l'ajout du fichier dans la DB : " + err);
            throw new Error("Erreur serveur lors de l'ajout du fichier dans la DB")
        }
    },

    getFiles: async (user) => {

        try {
            
            await sql.connect(sqlConfig)
            const request = new sql.Request()

            const teamId = await utilitFunc.getTeamIdByOU(user.team_ou)

            const result = await request
                .input("role", sql.VarChar, user.role)
                .input('teamId', sql.Int, teamId)
                .input('userId', sql.Int, user.id)
                    .query(`SELECT * FROM files 
                            WHERE
                                (@role = 'Admin)
                                OR (file_visibility = 'Public) 
                                OR (file_visibility = 'Team' AND FK_team_id = @teamId)
                                OR (file_visibility = 'Private' AND FK_user_id = @userId)
                                `)
 
            if (result.recordset <= 0) {
                throw new Error("Erreur lors de la récupération des fichiers. (SERVICE)")
            }

            return result.recordset

        } catch (err) {
            console.error(err);
            throw new Error(err.message)
        }

    },

    getFileByID: async (id) => {

        try {
            
            await sql.connect(sqlConfig)
            const request = new sql.Request()

            const result = await request
                    .input('fileID', sql.Int, id)
                    .query(`SELECT * FROM FILES WHERE file_id = @fileID`)

            if (result.recordset[0] <= 0) {
                throw new Error("Erreur lors de la récupération du fichier à télécharger. (SERVICE)")
            }

            return result.recordset[0]

        } catch (err) {
            console.error(err);
            throw new Error(err.message)
        }

    }

}

module.exports = filesService