const sqlConfig = require('../configs/sql.config')
const sql = require('mssql')
const accessService = require('./access.service')

const filesService = {

    putFileDB: async(filename, file_path, userID, visibility, roleRequired, file_type, file_size, teamId, description) => {
        try {
            
            await sql.connect(sqlConfig);
            const request = new sql.Request();

            const existing = await request
            .input('filename', sql.VarChar, filename)
            .query(`SELECT * FROM FILES WHERE file_name = @filename`,)

            if (existing.recordset.length > 0) {
            return { success: false, reason: "DUPLICATE" };
            }

            await request

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

            return { success : true }

        } catch (err) {
            console.error("Erreur serveur lors de l'ajout du fichier dans la DB : " + err);
            throw new Error("Erreur serveur lors de l'ajout du fichier dans la DB")
        }
    },

    getFiles: async (user, userTeam) => {

        try {
            
            await sql.connect(sqlConfig)
            const request = new sql.Request()
        

            const result = await request
                .input("role", sql.VarChar, user.role)
                .input('teamId', sql.Int, userTeam)
                .input('userId', sql.Int, user.id)
                .query(`
                    SELECT 
                        f.file_id,
                        f.file_name,
                        f.file_description,
                        f.file_visibility,
                        f.file_roleRequired,
                        f.file_size,
                        f.FK_team_id,
                        u.user_login_name AS uploader_name
                    FROM FILES f
                    INNER JOIN USERS u ON f.FK_user_id = u.user_id
                    ORDER BY f.file_uploadedAt DESC `)
 
            const files = result.recordset        
            const accessibleFiles = []

            for (const file of files) {
                const canAcess = await accessService.canAccessFile(user, file, userTeam )
                if (canAcess) {
                accessibleFiles.push(file)
                }
           }
           console.log("accessibleFiles : " + accessibleFiles);

            return accessibleFiles

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

    },
        getLatestFiles : async (user, limit, teamId) => {
        try {
            await sql.connect(sqlConfig)

            const request = new sql.Request()

            const result = await request
                .input("limit", sql.Int, limit * 5)
                .query(`
                    SELECT TOP (@limit) * 
                    FROM FILES
                    ORDER BY file_uploadedAt DESC
                    `)
                    
            const files = result.recordset

            const accessibleFiles = []

           for (const file of files) {
            const canAcess = await accessService.canAccessFile(user, file, teamId )
            if (canAcess) {
                accessibleFiles.push(file)
            }
            if (accessibleFiles.length >= limit) {
                break
            }
           }
           console.log("accessibleFiles : " + accessibleFiles);
           
            return accessibleFiles

        } catch (err) {
            console.error("Erreur récupération des derniers fichiers : " + err);
            throw new Error("Impossible de récupérer les derniers fichiers")
        }
    }

}

module.exports = filesService