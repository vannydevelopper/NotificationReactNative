const { query } = require("../functions/db");

const findBy = async (column, value) => {
  try {
    var sqlQuery = `SELECT * FROM utilisateurs  WHERE ${column} = ? AND (PROFIL_ID = 6 OR PROFIL_ID = 7 OR PROFIL_ID = 12 OR PROFIL_ID = 2 OR PROFIL_ID = 3 OR PROFIL_ID = 4 OR PROFIL_ID = 5) `;
    return query(sqlQuery, [value]);
  } catch (error) {
    throw error;
  }
};

const createOne = async (
  email,
  password,
  nom,
  prenom,
  numero,
  cni,
  sexe = null
) => {
  try {
    return query(
      "INSERT INTO utilisateurs(NOM_UTILISATEUR, MOT_DE_PASSE, PROFIL_ID, NOM_CITOYEN, PRENOM_CITOYEN, NUMERO_CITOYEN, CNI, SEXE) VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
      [email, password, 7, nom, prenom, numero, cni, sexe]
    );
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findBy,
  createOne,
};
