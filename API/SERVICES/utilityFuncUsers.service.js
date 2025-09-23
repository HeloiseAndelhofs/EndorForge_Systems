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

    getTeamIdByOU: async (ou) => {
    try {
        if (!ou) {
        console.error("OU fourni est null ou vide");
        return null; 
        }

        console.log("Recherche team pour OU =", ou);

        await sql.connect(sqlConfig);

        const result = await new sql.Request()
        .input('ou', sql.VarChar(100), ou.trim()) 
        .query(`
            SELECT team_id, team_name, team_ou 
            FROM TEAMS
            WHERE team_ou = @ou
        `);

        if (!result.recordset.length) {
        console.warn(`Aucune team trouvée avec l'OU "${ou}"`);
        return null; 
        }

        return result.recordset[0].team_id;

    } catch (err) {
        console.error("Erreur SQL dans getTeamIdByOU:", err);
        throw err; // on garde l'erreur réelle pour debug
    }
    },


    getTeamIdByName: async (teamName) => {

        try {
            
            await sql.connect(sqlConfig)

            const teamID = await new sql.Request()
                .input('name', sql.VarChar, teamName)
                .query(`SELECT team_id FROM TEAMS
                    WHERE team_ou = @name`)

            if (!teamID.recordset.length) {
                console.error("Aucune team trouvée avec ce nom");
                throw new Error('Pas de team avec ce nom')
            }

            return teamID.recordset[0].team_id

        } catch (err) {
            console.error(err);
            throw new Error('Erreur serveur pendant la récupération de la team par son nom (get team by name)')
        }

    }
}


module.exports = utilityFunctions
