const sql = require("mssql")
const sqlConfig = require('../configs/sql.config')
const logsAD_DB = require('../automated-funcs/syncAD_DB_logs')
const ad_db_func = require('../automated-funcs/checkSync_AD_DB')

const adminService = {

    getAllUsers : async() => {

        try {
            
            await sql.connect(sqlConfig)
            const result = await new sql.Request()
                .query(`
                    SELECT u.user_id, u.user_name, u.user_email, t.team_name, u.user_role
                    FROM USERS u
                    LEFT JOIN TEAMS t ON u.FK_team_id = t.team_id
                    `)

            return result.recordset

        } catch (err) {
            console.error(err);
        }

    },

    getAllTeams: async() => {

        try {
            
            await sql.connect(sqlConfig)
            const result = await new sql.Request()
                .query(`
                    SELECT team_id, team_name, team_ou
                    FROM TEAMS
                    `)

            return result.recordset

        } catch (err) {
            console.error(err);
        }

    },

    getLogs: async() => {
        try {
            
            const logs = await logsAD_DB.readLastLogs(200);
            return logs;

        } catch (err) {
            console.error(err);
        }
    },

    triggerSync: async() => {

        try {
            const result = await ad_db_func.syncCheck();
            logsAD_DB.appendLogsToFile(result);
            return { message: "Synchronisation lancée", result };
        } catch (err) {
            console.error(err);
        }
    }

}

module.exports = adminService