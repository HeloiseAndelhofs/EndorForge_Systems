const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs').promises;
//const { exec } = require('child_process');
const FileType = require('file-type');
const initClamscan = require('../configs/clamscan.config')
const filesService = require('../SERVICES/files.service');
const accessService = require("../SERVICES/access.service");
const utilityFunctions = require('../SERVICES/utilityFuncUsers.service');
const { error } = require('console');
//const clamscan = require('../configs/clamscan.config');

let tmpPath = null;

const filesController = {
  uploadFile: async (req, res) => {
    try {

      console.log(req.files);
      

      //PARTIE FICHIER, VERIFICATION TYPE, VIRUS, TAILLE ET AJOUT/MODIFICATION NOM

      //Vérifie si un fichier a bien été posté
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("Aucun fichier n'a été posté.");
      }

      const file = req.files.myFile;
      //console.log(req.files);
      
      //console.log(file);
      

      // Analyse le type MIME réel à partir du buffer
      const detectedType = await FileType.fileTypeFromBuffer(file.data);
      if (!detectedType) {
        return res.status(400).json({ message: "Type de fichier non détecté." });
      }

      //console.log(detectedType);
      

      const extension = path.extname(file.name).toLowerCase(); // ex. ".jpg"
      const baseName = path
        .basename(file.name, extension)
        .replace(/[^a-zA-Z0-9_]/g, '_') //n'autorise que les caractères a => z, A => Z, 0 => 9 et _, ce qui n'est pas la dedans est remplacé par un _
        .toLowerCase();

      // Prévient contre les extensions doubles (ex: "truc.jpg.php")
      const safeExt = '.' + detectedType.ext; // Ex : .jpg ou .docx
      if (extension !== safeExt) {
        return res.status(403).json({ message: "Extension incohérente avec le type réel." });
      }

      // Vérifie taille (max 5Mo ici)
      if (file.size > 5 * 1024 * 1024) {
        return res.status(413).json({ message: "Fichier trop volumineux." });
      }

      //Types MIMES et extensions autorisées
      const allowedMIMEs = [
        "application/pdf",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "application/vnd.oasis.opendocument.text",
        "image/gif"
      ];

      const allowedExtensions = [
        ".pdf", ".xls", ".xlsx", ".pptx", ".docx",
        ".jpg", ".jpeg", ".png", ".odt", ".gif"
      ];

      // Vérification des types autorisés
      if (
        !allowedMIMEs.includes(file.mimetype) ||
        !allowedMIMEs.includes(detectedType.mime) ||
        !allowedExtensions.includes(extension)
      ) {
        return res.status(403).json({ message: "Type ou extension non autorisé." });
      }

      // Vérifie cohérence entre MIME déclaré (par le navigateur) et MIME réel
      if (file.mimetype !== detectedType.mime) {
        return res.status(403).json({ message: "Type MIME déclaré incohérent avec le type réel." });
      }

      // Authentification utilisateur
      const authHeader = req.headers['authorization']
      const token = authHeader && authHeader.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const uploaderName = decoded.username;

      //Prépare les chemins fichiers
      const finalFileName = `${uploaderName}_${baseName}${extension}`;
      const finalPath = path.join(__dirname, '../FILES/filesUploaded', finalFileName);
      const relativePath = `filesUploaded/${finalFileName}`;
      
      // Dans dossier temopraire pour analyse antivirus
      tmpPath = path.join(__dirname, '../FILES/tmp', finalFileName);
      await fs.writeFile(tmpPath, file.data);

      // Scan ClamAV sur fichier temporaire
      const clamscan = await initClamscan()
      const { isInfected, viruses } = await clamscan.isInfected(tmpPath);
      if (isInfected) {

        await fs.unlink(tmpPath); // supprime le fichier infecté
        return res.status(403).json({
          message: "Fichier infecté détecté.",
          viruses

        });
      }


      // Déplace le fichier validé dans le dossier final
      await fs.rename(tmpPath, finalPath);
      tmpPath = null //Plus besoin de supprimer (déplacer correcetment dans dossier permanent)

      //FIN DE LA PARTIE FICHIERS
      console.log(req.body);
      
      const { description, visibility, roleRequired, teamName } = req.body
      console.log(visibility);
      
      const validatedInput = await accessService.validateFileAccessOptions(decoded, visibility, roleRequired, teamName)

      // Enregistre en base de données
      const result = await filesService.putFileDB(
          file.name,
          relativePath,
          decoded.id,
          validatedInput.visibility,
          validatedInput.roleRequired,
          file.mimetype,
          file.size,
          validatedInput.teamId,
          description
        );

      if (!result.success && result.reason === "DUPLICATE") {
        return res.status(409).json({ message : "Ce fichier existe déja." })
      }

      return res.send("Fichier uploadé avec succès.");

    } catch (err) {
      console.error("Erreur serveur lors de l'upload : " + err);

      // Supprime le fichier temporaire s'il y a eu une erreur
      if (tmpPath) {
        try {
          await fs.unlink(tmpPath);
        } catch (cleanupErr) {
          console.warn("Fichier temporaire non supprimé :", cleanupErr.message);
        }
      }

      return res.status(500).json({ message: err.message || "Erreur serveur lors de l'upload" });
    }
  },

  getFiles: async (req, res) => {
    try {
      
      const authHeader = req.headers['authorization']
      const token = authHeader && authHeader.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const teamId = await utilityFunctions.getTeamIdByName(decoded.ou)
      const filesList = await filesService.getFiles(decoded, teamId)
      

      if (filesList.length > 0) {      
        const accessibleFiles = filesList.filter(file => 
          accessService.canAccessFile(decoded, file, teamId)
        )
  
        if (accessibleFiles) {
          return res.status(200).json(accessibleFiles)
  
        } else {
  
          return res.status(404).json({message : "Une erreur est survenue lors de la récupération des fichiers, rien n'a été récupéré. (CONTROLLER)"})
        }
      }

      return res.status(300).json({ message: "Aucun fichier disponible" })


    } catch (err) {

      console.error("Erreur serveur lors de la récupération des fichiers : " + err);
      return res.status(500).json({ message: "Erreur serveur lors de la récupération des fichiers" });

    }
  },

  downloadFiles: async (req, res) => {
    try {

      const fileID = req.params.id
      const user = req.payload
      
      const file = await filesService.getFileByID(fileID)
      if (!file) {
        return res.status(404).json({ message : "Aucun fichier trouvé, erreur lors de la récupération du fichier à télécharger. (CONTROLLER)" })
      }
      
      //LOGIQUE POUR VERIFIER LES DROITS D'ACCES TELECHARGEMENT
      const canDowload = accessService.canAccessFile(user, file)
      
      if (!canDowload) {
        return res.status(403).json({ message: "Vous n'avez pas l'autorisation de télécharger ce fichier." })
      }

      const absolutePath = path.join(__dirname, "../FILES", file.file_path)
      return res.download(absolutePath, file.file_name, (err) => {
        if (err) {
          console.error("Erreur download : " + err);
          
          if (!res.headersSent) {
            return res.status(500).json({
              message: "Erreur lors du téléchargement du fichier"
            })
          }
        }
      }) //param 2 = nom du fichier qui sera donné au navigateur

    } catch (err) {
      console.error("Erreur serveur lors du téléchargement des fichiers : " + err);
      return res.status(500).json({ message: "Erreur lors de la récupération des fichiers" });
    }
  },

  getLatestFiles : async (req, res) => {
    try {
      
      const authHeader = req.headers['authorization']
      const token = authHeader && authHeader.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const teamId = await utilityFunctions.getTeamIdByName(decoded.ou)
      const result = await filesService.getLatestFiles(decoded, 3, teamId)

      if (!result || result.length <= 0) {
        return res.status(404).json({ message : "Aucun fichier trouvé." })
      }
      console.log(result);
      
      return res.json(result)

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message : "Erreur lors de la récupération des fichiers récents" })
    }
  }
};

module.exports = filesController;
