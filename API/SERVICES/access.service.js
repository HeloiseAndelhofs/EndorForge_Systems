const accessService = {

    canAccessFile: (user, file) => {

        // Cas où un rôle est requis : priorité
        if (file.file_roleRequired && user.role === file.file_roleRequired) {
            return true;
        }

        switch (file.file_visibility) {
            
        case "Public":
            return true;

        case "Team":
            return user.team === file.FK_team_id;

        case "Private":
            return user.id === file.FK_user_id || user.role === "Admin";

        default:
            return false;
        }
    }
};

module.exports = accessService;
