const jwt = require('jsonwebtoken')
const path = require('path')
const FileType = require('file-type')
const clamav = require('clamscan')

const options = {
    remove_infected: true,
    quarantine_infected: true,
    scan_log: "/home/hlo/Documents/code/EndorForge_utils/logs_files", 
    debug_mode: true
};

const filesService = require('../SERVICES/files.service')


const filesController = {

  uploadFile: async (req, res) => {
    try {
      

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("Aucun fichier n'a été posté.");
      }

      const file = req.files.myFile;

      
      // Détection réelle du type MIME
      const detectedType = await FileType.fromBuffer(file.data);
      
      if (!detectedType) {
          return res.status(400).json({ message: "Type de fichier non détecté." });
        }
        
        const extension = path.extname(file.name).toLowerCase(); // e.g. ".jpg"
        const baseName = path.basename(file.name, extension).replace(/[^a-zA-Z0-9-_]/g, '_');
        
        const token = req.cookies.accessToken;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const uploaderName = decoded.username;
        
        const filePath = `${uploaderName}_${baseName}${extension}`;
        const relativePath = `filesUploaded/${filePath}`;
        const uploadPath = path.join(__dirname, '../filesUploaded', filePath);
        
        //Scan le fichier pour virus
        const scanner = clamav.createScanner("/usr/bin/clamscan", options);
        scanner.scan(file, function(err, file, isInfected) {
              if (err) {
              console.log("Error scanning file: ", err);
              } else if (isInfected) {
              console.log("File is infected:", file);
              } else {
              console.log("File is clean:", file);
              }
            });


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
            ".pdf",
            ".xls", ".xlsx",
        ".pptx",
        ".docx",
        ".jpg", ".jpeg",
        ".png",
        ".odt",
        ".gif"
      ];

      // Limite de taille
      if (file.size > 5 * 1024 * 1024) {
        return res.status(413).json({ message: "Fichier trop volumineux." });
      }

      // Vérification MIME type (réel + déclaré)
      if (
        !allowedMIMEs.includes(file.mimetype) ||
        !allowedMIMEs.includes(detectedType.mime)
      ) {
        return res.status(403).json({ message: "Type MIME non autorisé." });
      }

      // Vérification extension
      if (!allowedExtensions.includes(extension)) {
        return res.status(403).json({ message: "Extension de fichier non autorisée." });
      }

      // Incohérence MIME déclaré vs réel
      if (file.mimetype !== detectedType.mime) {
        return res.status(403).json({
          message: "Incohérence entre le type MIME déclaré et le type réel du fichier.",
        });
      }

      //Sauvegarde sur le disque
      await file.mv(uploadPath);

      //Enregistrement DB
      await filesService.putFileDB(file.name, relativePath, decoded.id, file.mimetype, file.size);

      return res.send('Fichier uploadé avec succès');
    } catch (err) {
      console.error("Erreur serveur lors de l'upload du fichier : " + err);
      return res.status(500).json({ message: "Erreur serveur lors de l'upload du fichier" });
    }
  },

    getFiles: async(req, res) => {
        try {
            


        } catch (err) {
            console.error("Erreur serveur lors de la récuperation des fichiers : " + err);
            return res.status(500).json({ message: "Erreur serveur lors de la récuperation des fichiers" })
        }
    },

    downloadFiles: async(req, res) => {
        try {
            
        } catch (err) {
            console.error("Erreur serveur lorss du téléchargement des fichiers : " + err);
            return res.status(500).json({ message: "Erreur lors de la récuperation des fichiers" })
        }
    }

}

module.exports = filesController