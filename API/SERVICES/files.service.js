const sqlConfig = require('../configs/sql.config')
const sql = require('mssql')

const filesService = {

    putFileDB: async(filename, file_path, userID, file_type, file_size) => {
        try {
            
            await sql.connect(sqlConfig);
            const request = new sql.Request();
            await request
                .input('filename', sql.VarChar, filename)
                .input('file_path', sql.VarChar, file_path)
                .input('userId', sql.Int, userID)
                //.input('uploadedAt', sql.DateTime, new Date())
                .input('file_type', sql.VarChar, file_type)
                .input('file_size', sql.Int, file_size)
                .query(`
                    INSERT INTO FILES (file_name, file_path, FK_user_id, file_type, file_size)
                    VALUES (@filename, @file_path, @userId,  @file_type, @file_size)
                `)

            return

        } catch (err) {
            console.error("Erreur serveur lors de l'ajout du fichier dans la DB : " + err);
            throw new Error("Erreur serveur lors de l'ajout du fichier dans la DB")
        }
    }

}

module.exports = filesService