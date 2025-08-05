// Initialise le scanner ClamAV
const NodeClam = require('clamscan');

const initClamscan = async () => {

  const clamscan = new NodeClam().init({

          remove_infected: false,
          quarantine_infected: false,
          scan_log: null,
          debug_mode: false,
          file_list: null,
          scan_recursively: false,
          clamdscan: {
            socket: false,
            host: '127.0.0.1',
            port: 3310,
            timeout: 60000,
            local_fallback: false,
          },
          preference: 'clamdscan',

        });

  return clamscan
} 


module.exports = initClamscan;
