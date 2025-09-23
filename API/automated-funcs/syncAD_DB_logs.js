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
    
    }
}

module.exports = logsSync