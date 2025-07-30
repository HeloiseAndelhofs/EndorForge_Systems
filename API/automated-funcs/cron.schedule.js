const cron = require('node-cron');
const ad_db_func = require('./checkSync_AD_DB');
const logsAD_DB = require('./syncAD_DB_logs')


cron.schedule('0 0 * * *', async () => {
  try {

    console.log('[CRON] Lancement de la synchronisation AD ↔ DB');
    const data = await ad_db_func.syncCheck();
    console.log(data);
    
    logsAD_DB.appendLogsToFile(data)
    console.log('[CRON] Synchronisation terminée.');

  } catch (err) {
    logsAD_DB.appendLogsToFile([`Erreur de synchronisation : ${err.message}`])
    console.error('[CRON] Erreur pendant la synchronisation :', err);
  }
});
