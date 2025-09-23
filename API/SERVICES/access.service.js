const utilityFunc = require('../SERVICES/utilityFuncUsers.service')


const accessService = {

    canAccessFile: async (user, file, userTeam) => {
        
        const userRole = user.role
        const requiredRole = file.file_roleRequired
        const isAdmin = userRole === "Admin"

        // Cas où un rôle est requis : priorité
        if (requiredRole) {
            if (!isAdmin && userRole !== requiredRole) {
                return false
            }
        }

        switch (file.file_visibility) {
            
        case "Public":
            return true;

        case "Team":
            return file.FK_team_id === userTeam || isAdmin

        case "Private":
            return user.id === file.FK_user_id || user.role === "Admin"

        default:
            return false;
        }
    },

    validateFileAccessOptions: async (user, visibility, roleRequired, teamName) => {

        const allowedVisibility = ["Public", "Team", "Private"];
        const allowedRoles = ["Admin", "RABADON", "TRINITE", "MERCURE", "COOKIES", "PINKWARD"];

        let teamId;

        // Vérif visibilité
        if (!allowedVisibility.includes(visibility)) {
        throw new Error("Visibilité invalide");
        }

        if (visibility === "Team") {
            if(!teamName) {
                throw new Error("Le nom de l'équipe est requis pour la visibilité 'Team'")
            }
            teamId = await utilityFunc.getTeamIdByName(teamName)
            if (!teamId) {
                throw new Error("Aucune équipe associée à ce nom")
            }
        }

        // Vérif rôle requis (si fourni)
        if (roleRequired && !allowedRoles.includes(roleRequired)) {
        throw new Error("Rôle invalide");
        }

        // Vérif droits de l’utilisateur
        if (roleRequired === "Admin" && user.role !== "Admin") {
        throw new Error("Vous n'avez pas les droits pour restreindre aux admins.");
        }

        // Si tout est OK → renvoyer les valeurs validées
        return { visibility, roleRequired, teamId };
  }
};

module.exports = accessService;
