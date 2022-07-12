const Validation = require("../../class/Validation");
const { query } = require("../../functions/db");
const moment = require("moment");
const sendPushNotifications = require("../../functions/sendPushNotifications");
const notificationModel = require("../../model/notificationModel")

const createNotification = async (request, response) => {
          try {
                    const { TITRE, CONTENU, } = request.body;

                    const validation = new Validation(
                              request.body,
                              {
                                        TITRE: {
                                                  required: true,
                                                  length: [1, 55],
                                        },
                                        CONTENU: {
                                                  required: true,
                                                  length: [1, 55],
                                        },
                              },
                              {
                                        TITRE: {
                                                  required: "Le titre est obligatoire",
                                                  length: "Le titre invalide",
                                        },
                                        CONTENU: {
                                                  required: "Le contenu est obligatoire",
                                                  length: "Le contenu invalide",
                                        },
                              }
                    );
                    validation.run();
                    if (validation.isValidate()) {
                              const polices = await query('SELECT TOKEN FROM  notification_tokens WHERE TOKEN IS NOT NULL AND 	IS_CITOYEN=0')

                              const tokens = polices.map(pol => pol.TOKEN);
                              const reponse = await Promise.all(tokens.map(async token => {
                                        const { insertId } = await notificationModel.createOne(
                                                  TITRE,
                                                  CONTENU,
                                                  token
                                        );
                              }))
                              sendPushNotifications(tokens, TITRE, CONTENU, {
                                        url: "psr://Root/HomeTab/Notification"
                              })
                              response.status(200).json({
                                        ...request.body,
                                        message: "La notification a ete envoye",
                              })

                    }
                    else {
                              response.status(422).json({
                                        success: false,
                                        message: "La validation des données a échoué",
                                        errors: validation.getErrors(),
                              });
                    }
          }
          catch (error) {
                    console.log(error)
                    response.status(500).json({
                              errors: {
                                        main: "Erreur interne du serveur, réessayer plus tard",
                              },
                    });
          }
};

const createOneNotification = async (req, res) => {
          try {
                    const { tokens, TITRE, CONTENU } = req.body
                    const validation = new Validation(req.body);
                    validation.run();
                    if (validation.isValidate()) {
                              const reponse = await Promise.all(tokens.map(async token => {
                                        const { insertId } = await notificationModel.createOne(
                                                  TITRE,
                                                  CONTENU,
                                                  token
                                        );
                              }))
                              sendPushNotifications(tokens, TITRE, CONTENU, {
                                        url: "psr://Root/HomeTab/Notification"
                              })
                              res.status(200).json({
                                        ...req.body,
                                        message: "La notification a ete envoye",
                              })
                    } else {
                              res.status(422).json({
                                        success: false,
                                        message: "La validation des données a échoué",
                                        errors: validation.getErrors(),
                              });
                    }
          }
          catch (error) {
                    console.log(error)
                    res.status(500).json({
                              errors: {
                                        main: "Erreur interne du serveur, réessayer plus tard",
                              },
                    });
          }
};


const findNotification = async (req, res) => {
          try {
                    const { token } = req.query
                    // console.log(token)
                    // console.log(req.query)
                    if (token && token != "") {
                              const notification = await notificationModel.findAll(token);
                              const updateNotif = await notificationModel.readMessage(token);
                              res.status(200).json(notification);
                    } else {
                              res.status(422).json([])
                    }

          } catch (error) {
                    console.log(error);
                    res.status(500).send("Server error");
          }
};

const updateNotification = async (req, res) => {
          try {
                    const { token } = req.query
                    const updateNotif = await notificationModel.readMessage(token);
                    res.status(200).json({
                              success: true,
                              message: "La modification est faite avec succees",
                    })
          }
          catch (error) {
                    console.log(error);
                    res.status(500).send("Server error")
          }
};

const compteNotification = async (req, res) => {
          try {
                    const { token } = req.query
                    const compte = (await notificationModel.compteMessage(token))[0];
                    res.status(200).json(compte)
          }
          catch (error) {
                    console.log(error);
                    res.status(500).send("Server error")

          }
}

module.exports = {
          createNotification,
          findNotification,
          updateNotification,
          compteNotification,
          createOneNotification
}