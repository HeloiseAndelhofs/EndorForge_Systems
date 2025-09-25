const { log } = require('console');
const fs = require('fs')


const today = new Date().toISOString().split('T')[0];
const logFile = `c:/logs_syncAD_DB/sync-${today}.txt`

const logsSync = {

    appendLogsToFile: (dataArray) => {
        
        const timestamp = new Date().toLocaleString("fr-BE", { timeZone: "UTC" })
        const logContent = dataArray.map(item => {
            if (typeof item === "string") return `${timestamp} : ${item}`
            return `${timestamp} : ${JSON.stringify(item, null, 2)}`
        }).join("\r\n")
    
        fs.appendFileSync(logFile, logContent)
    
    },

     // Récupère les X dernières lignes
    readLastLogs: async (limit) => {

        try {

        if (!fs.existsSync(logFile)) {
            return [];
        }

        const content = fs.readFileSync(logFile, "utf8");
        
        const lines = content.trim().split("\n");

        return lines.slice(-limit);

        } catch (err) {
        console.error("[LOGS] Erreur lecture du fichier de logs :", err);
        return [];

        }

    }

}

module.exports = logsSync