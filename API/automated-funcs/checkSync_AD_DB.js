const sql = require('mssql')
const sqlConfig = require('../configs/sql.config.js');
const { Client } = require('ldapts')
const adConfig = require('../configs/activeDirectory.config');
const utilityFunctions = require('../SERVICES/utilityFuncUsers.service.js');

let datasLog = [];

const ad_db_func = {
  syncCheck: async () => {
    datasLog = []; // Réinitialiser à chaque exécution

    await sql.connect(sqlConfig);
    const ad = new Client({ url: adConfig.url, tlsOptions: adConfig.tlsOptions });

    try {
      await ad.bind(adConfig.bindDN, adConfig.bindCredentials);

      // Récupérer tous les utilisateurs de la DB + leur équipe
      const usersDB = await new sql.Request()
        .query(`
          SELECT 
            u.user_id, u.user_email, u.user_name, u.user_firstname, u.user_login_name,
            u.user_contract_type, u.FK_team_id,
            t.team_id, t.team_name
          FROM users u 
          JOIN teams t ON u.FK_team_id = t.team_id
        `);

      // Requête 1 : récupérer tous les utilisateurs AD
      const { searchEntries: userEntries } = await ad.search("OU=endorforgeOrga,DC=endorforge,DC=local", {
        scope: 'sub',
        filter: '(objectClass=person)', // ou "user"
        attributes: ['uid', 'cn', 'mail', 'sAMAccountName'],
      });

      // Requête 2 : récupérer tous les groupes avec leurs membres
      const { searchEntries: groupEntries } = await ad.search("OU=endorforgeOrga,DC=endorforge,DC=local", {
        scope: 'sub',
        filter: '(objectClass=group)',
        attributes: ['cn', 'member'],
      });

      console.log(groupEntries);
      

      // Construire la map UserDN -> Groupes
      const userGroupsMap = {};
      for (const group of groupEntries) {
        if (!group.member) continue; // éviter les groupes vides
        const members = Array.isArray(group.member) ? group.member : [group.member];

        for (const memberDN of members) {
          if (!userGroupsMap[memberDN]) {
            userGroupsMap[memberDN] = [];
          }
          userGroupsMap[memberDN].push(group.cn);
        }
      }

      console.log(userGroupsMap);
      

      // Fonctions utilitaires
      function getContractType(groups) {
        if (!groups) return null;
        if (groups.includes('gg_COOKIES')) return 'COOKIES';
        if (groups.includes('gg_CDI')) return 'CDI';
        if (groups.includes('gg_CDD')) return 'CDD';
        return null;
      }

      function getUserRole(groups) {
        if (!groups) return null;
        if (groups.includes('RABADON')) return 'RABADON';
        if (groups.includes('TRINITE')) return 'TRINITE';
        if (groups.includes('MERCURE')) return 'MERCURE';
        if (groups.includes('COOKIES')) return 'COOKIES';
        if (groups.includes('PINKWARD')) return 'PINKWARD';
        if (groups.includes('gg_admin')) return 'admin';

        return null;
      }

      // Vérifier cohérence DB -> AD
      for (const userDB of usersDB.recordset) {
        const matchInAD = userEntries.find(userAD => userAD.mail === userDB.user_email);

        if (!matchInAD) {
          const msg = `L'utilisateur avec le mail ${userDB.user_email} est dans la DB mais pas dans l'AD`;
          console.warn(msg);
          datasLog.push(msg);
          continue; // ne pas quitter toute la fonction
        }

        const msg = `OK : ${userDB.user_email} est présent dans DB et AD`;
        console.log(msg);
        datasLog.push(msg);
      }

      // Vérifier cohérence AD -> DB
      for (const userAD of userEntries) {
        const matchInDB = usersDB.recordset.find(userDB => userDB.user_email === userAD.mail);

        if (!matchInDB) {
          const msg = `L'utilisateur ${userAD.mail} est dans l'AD mais pas dans la DB → création`;
          console.warn(msg);

          const [name, firstname = ""] = userAD.cn ? userAD.cn.split(" ") : ["", ""]; // fallback si cn pas standard
          const loginName = userAD.sAMAccountName;
          const mail = userAD.mail;

          const groups = userGroupsMap[userAD.dn] || [];
          const contractType = getContractType(groups);
          const role = getUserRole(groups);

          const match = userAD.dn.match(/ou=([^,]+)/i);
          const ou = match ? match[1] : null;

          if (!ou) {
            datasLog.push(`Impossible de trouver une team pour OU "null" (user: ${userAD.name || 'inconnu'}). Utilisateur non inséré.`);
            continue; // skip cet utilisateur
          }

          const teamID = await utilityFunctions.getTeamIdByOU(ou);

          if (!teamID) {
            datasLog.push(`Impossible de trouver une team pour OU "${ou}" (user: ${userAD.name || 'inconnu'}). Utilisateur non inséré.`);
            continue; // skip cet utilisateur
          }



          const isActive = true;
          const birthday = '1985-04-17'; // à remplacer plus tard par la vraie donnée

          const req = new sql.Request();
          await req
            .input('name', sql.VarChar(100), name)
            .input('firstname', sql.VarChar(100), firstname)
            .input('loginName', sql.VarChar(100), loginName)
            .input('email', sql.VarChar(255), mail)
            .input('birthday', sql.Date, birthday)
            .input('role', sql.VarChar(50), role)
            .input('isActive', sql.Bit, isActive)
            .input('createdAt', sql.DateTime, new Date())
            .input('updatedAt', sql.DateTime, new Date())
            .input('contract', sql.VarChar(50), contractType)
            .input('teamID', sql.Int, teamID)
            .query(`
              INSERT INTO USERS (
                user_name, user_firstname, user_login_name, user_email, user_birthdate, user_role,
                user_isActive, user_createdAt, user_updatedAt, user_contract_type, FK_team_id
              )
              VALUES (@name, @firstname, @loginName, @email, @birthday, @role,
                @isActive, @createdAt, @updatedAt, @contract, @teamID)
            `);

          datasLog.push({
            message: msg,
            email: userAD.mail,
            role,
            contractType,
            teamID
          });
          continue;
        }

        const msg = `OK : ${userAD.mail} est présent dans AD et DB`;
        console.log(msg);
        datasLog.push(msg);
      }

    } catch (err) {
      const errorMsg = `Erreur de synchronisation AD-DB : ${err.message}`;
      datasLog.push(errorMsg);
      console.error(errorMsg, err);
      throw err;
    } finally {
      try {
        await ad.unbind();
      } catch (unbindErr) {
        console.error("Erreur lors du unbind LDAP :", unbindErr);
      }
      return datasLog;
    }
  }
};

module.exports = ad_db_func;
