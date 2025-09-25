const adminService = require('../SERVICES/admin.service')


const admin = {

    getAllUsers : async (req, res) => {

        try {
            
            const users = await adminService.getAllUsers()

            if (!users) {
                return res.status(404).json({ message: "Aucun utilisateurs trouvés" })
            }

            return res.json(users)

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Erreur serveur récupération users" })
        }
    },

    getAllTeams: async (req, res) => {

        try {
            
            const teams = await adminService.getAllTeams()

            if (!teams) {
                return res.status(404).json({ message : "Aucune team trouvée" })
            }

            return res.status(200).json(teams)

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Erreur serveur récupération des teams" })
        }

    },

    getLogs: async (req, res) => {

        try {

            const logs = await adminService.getLogs();
            res.json(logs);

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur lecture logs" });
        }

  },

  triggerSync: async (req, res) => {

    try {

      const result = await adminService.triggerSync();
      res.json(result);

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur lancement synchro" });
    }
    
  }

}

module.exports = admin