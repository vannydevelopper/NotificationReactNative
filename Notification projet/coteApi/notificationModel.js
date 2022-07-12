const moment = require("moment");
const { query } = require("../functions/db");

const findAll = async (token) => {
          try {
                    var sqlQuery = "SELECT * FROM notifications_receive WHERE 1 AND TOKEN=?";
                    sqlQuery += " ORDER BY DATE_INSERT DESC LIMIT 10";
                    return query(sqlQuery, [token]);
          } catch (error) {
                    throw error;
          }
};

const createOne = async (
          TITRE,
          CONTENU,
          TOKEN
) => {
          try {
                    var sqlQuery = "INSERT INTO notifications_receive(TITRE, CONTENU,TOKEN)";
                    sqlQuery += " VALUES(?, ?, ?)";
                    return query(sqlQuery, [
                              TITRE,
                              CONTENU,
                              TOKEN
                    ])
          }
          catch (error) {
                    throw error
          }
};

const findById = async (id) => {
          try {
                    return query("SELECT * FROM notifications_receive WHERE ID_NOTIFICATIONS_RECEIVE  = ?", [
                              id,
                    ]);
          } catch (error) {
                    throw error;
          }
};

const readMessage = async (token) => {
          try {
                    return query("UPDATE notifications_receive SET IS_READ=1 WHERE TOKEN=?", [token])
          }
          catch (error) {
                    throw error;
          }
};

const compteMessage = (token) => {
          try {
                    return query("SELECT COUNT(ID_NOTIFICATIONS_RECEIVE) as nbre FROM notifications_receive WHERE 1 AND TOKEN=? AND IS_READ=0 ", [token])
          }
          catch (error) {
                    throw error;
          }
}

module.exports = {
          findAll,
          createOne,
          findById,
          readMessage,
          compteMessage
}