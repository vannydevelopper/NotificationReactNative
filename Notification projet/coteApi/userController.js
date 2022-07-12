const Validation = require("../class/Validation");
const generateToken = require("../functions/generateToken");
const userModel = require("../model/userModel");
const md5 = require("md5");
const { query } = require("../functions/db");

const login = async (req, res) => {
          try {
                    const { email, password, lat, long, PUSH_NOTIFICATION_TOKEN, DEVICE } = req.body;
                    const validation = new Validation(
                              req.body,
                              {
                                        email: "required",
                                        password: {
                                                  required: true,
                                                  length: [8],
                                        },
                              },
                              {
                                        email: {
                                                  required: {
                                                            fr: "L'email est requis",
                                                            en: "Email is required",
                                                            bi: "Email irakenewe",
                                                            sw: "Barua pepe inahitajika",
                                                  },
                                        },
                                        password: {
                                                  required: {
                                                            fr: "Le mot de passe est requis",
                                                            en: "Password is required",
                                                            bi: "Akabanga karakenewe",
                                                            sw: "Nenosiri linahitajika",
                                                  },
                                                  length: {
                                                            fr: "Mot de passe trop court",
                                                            en: "Password is too weak",
                                                            bi: "Akabanga kanyu ni kagufi",
                                                            sw: "Nenosiri fupi mno",
                                                  },
                                        },
                              }
                    );
                    validation.run();
                    if (!validation.isValidate()) {
                              return res.status(422).json({ errors: validation.getErrors() });
                    }

                    var user = (await userModel.findBy("NOM_UTILISATEUR", email))[0];
                    if (user) {
                              if (user.MOT_DE_PASSE == md5(password)) {
                                        if (user.PROFIL_ID == 6 || user.PROFIL_ID == 12) {
                                                  var sqlQuery =
                                                            "SELECT pe.ID_PSR_ELEMENT, pe.NOM, pe.PRENOM, pe.NUMERO_MATRICULE, pe.PHOTO, ";
                                                  sqlQuery += " pea.DATE_DEBUT, pea.DATE_FIN, paff.LIEU_EXACTE ";
                                                  sqlQuery += " FROM psr_elements pe ";
                                                  sqlQuery +=
                                                            " LEFT JOIN psr_element_affectation pea ON pea.ID_PSR_ELEMENT = pe.ID_PSR_ELEMENT AND pea.IS_ACTIVE = 1 ";
                                                  sqlQuery +=
                                                            " LEFT JOIN psr_affectatations paff ON paff.PSR_AFFECTATION_ID = pea.PSR_AFFECTATION_ID ";
                                                  sqlQuery +=
                                                            " WHERE pe.ID_PSR_ELEMENT = ? ORDER BY pea.DATE_INSERT DESC LIMIT 1 ";
                                                  const psrElement = (await query(sqlQuery, [user.PSR_ELEMENT_ID]))[0];
                                                  if (psrElement) {
                                                            user = { ...user, ...psrElement };
                                                  } else {
                                                            const errors = {
                                                                      main: {
                                                                                fr: "Identifiants incorrects",
                                                                                en: "Incorrect identification",
                                                                                bi: "Umwidondoro wanyu siwo",
                                                                                sw: "Kitambulisho kisicho sahihi",
                                                                      },
                                                            };
                                                            return res.status(404).json({ errors });
                                                  }
                                        }
                                        const re = await query(
                                                  "UPDATE utilisateurs SET LATITUDE = ?, LONGITUDE = ?, IS_ACTIF = 1 WHERE ID_UTILISATEUR = ?",
                                                  [lat, long, user.ID_UTILISATEUR]
                                        );
                                        const notification = (await query('SELECT * FROM notification_tokens WHERE TOKEN = ? AND ID_UTILISATEUR = ?', [PUSH_NOTIFICATION_TOKEN, user.ID_UTILISATEUR]))[0]
                                        if (!notification && PUSH_NOTIFICATION_TOKEN) {
                                                  await query('INSERT INTO notification_tokens(ID_UTILISATEUR, DEVICE, TOKEN, IS_CITOYEN) VALUES(?, ?, ?, ?)', [user.ID_UTILISATEUR, DEVICE, PUSH_NOTIFICATION_TOKEN, user.PROFIL_ID == 7]);
                                        }
                                        var tokenData = { ...user };

                                        if (
                                                  user.PROFIL_ID == 2 ||
                                                  user.PROFIL_ID == 3 ||
                                                  user.PROFIL_ID == 4 ||
                                                  user.PROFIL_ID == 5
                                        ) {
                                                  const { ID_UTILISATEUR, NOM_UTILISATEUR, PROFIL_ID } = user;
                                                  tokenData = { ID_UTILISATEUR, NOM_UTILISATEUR, PROFIL_ID };
                                        }
                                        res.status(200).json({
                                                  success: true,
                                                  message: "vous avez été connecté avec succès",
                                                  TOKEN: generateToken(tokenData, 3600 * 24 * 365 * 3),
                                                  ...tokenData,
                                        });
                              } else {
                                        const errors = {
                                                  main: {
                                                            fr: "Identifiants incorrects",
                                                            en: "Incorrect identification",
                                                            bi: "Umwidondoro wanyu siwo",
                                                            sw: "Kitambulisho kisicho sahihi",
                                                  },
                                        };
                                        res.status(404).json({ errors });
                              }
                    } else {
                              const errors = {
                                        main: {
                                                  fr: "Identifiants incorrects",
                                                  en: "Incorrect identification",
                                                  bi: "Umwidondoro wanyu siwo",
                                                  sw: "Kitambulisho kisicho sahihi",
                                        },
                              };
                              res.status(404).json({ errors });
                    }
          } catch (error) {
                    console.log(error);
                    res.status(500).send("Server error");
          }
};

const logOut = async (req, res) => {

  const {PUSH_NOTIFICATION_TOKEN} = req.body;
  //console.log(req.body)
  //console.log(req.userId)
          try {
                    await query(
                              "UPDATE utilisateurs SET IS_ACTIF = 0 WHERE ID_UTILISATEUR = ?",
                              [req.userId]
                    );
                    const notification = (await query('SELECT * FROM notification_tokens WHERE TOKEN = ? AND ID_UTILISATEUR = ?', [PUSH_NOTIFICATION_TOKEN, req.userId]))[0]
                    if (notification) {
                          await query('DELETE FROM notification_tokens  WHERE TOKEN = ? AND ID_UTILISATEUR = ?', [ PUSH_NOTIFICATION_TOKEN,req.userId]);
                    }
                    res.status(200).json({
                              logOut: true,
                    });
          } catch (error) {
                    console.log(error);
                    res.status(500).send("Server error");
          }
};

const create = async (req, res) => {
          try {
                    const { password, nom, prenom, numero, cni, sexe, lat, long, PUSH_NOTIFICATION_TOKEN, DEVICE } = req.body;
                    const validation = new Validation(
                              req.body,
                              {
                                        password: {
                                                  required: true,
                                                  length: [8],
                                        },
                                        nom: "required",
                                        prenom: "required",
                                        numero: "required",
                                        cni: "required",
                              },
                              {
                                        password: {
                                                  required: "Le mot de passe est requis",
                                                  length: {
                                                            fr: "Mot de passe trop court",
                                                            en: "Password is too weak",
                                                            bi: "Akabanga kanyu ni kagufi",
                                                            sw: "Nenosiri fupi mno",
                                                  },
                                        },
                                        nom: {
                                                  required: "Le nom est requis",
                                        },
                                        prenom: {
                                                  required: "Le prénom est requis",
                                        },
                                        numero: {
                                                  required: "Le numéro est requis",
                                        },
                                        cni: {
                                                  required: "Le numéro d'identité est requis",
                                        },
                              }
                    );
                    const userNumero = (await userModel.findBy("NUMERO_CITOYEN", numero))[0];
                    if (userNumero) {
                              validation.setError("numero", {
                                        fr: "Numéro de téléphone déjà utilisé",
                                        en: "Phone number already in use",
                                        bi: "Inomero ya ngendanwa yaramaze gukoreshwa",
                                        sw: "Nambari ya simu tayari inatumika",
                              });
                    }
                    validation.run();
                    if (!validation.isValidate()) {
                              return res.status(422).json({ errors: validation.getErrors() });
                    }
                    const { insertId } = await userModel.createOne(
                              numero,
                              md5(password),
                              nom,
                              prenom,
                              numero,
                              cni,
                              sexe
                    );
                    const user = (await userModel.findBy("ID_UTILISATEUR", insertId))[0];
                    const re = await query(
                              "UPDATE utilisateurs SET LATITUDE = ?, LONGITUDE = ? WHERE ID_UTILISATEUR = ?",
                              [lat, long, insertId]
                    );
                    const notification = (await query('SELECT * FROM notification_tokens WHERE TOKEN = ? AND ID_UTILISATEUR = ?', [PUSH_NOTIFICATION_TOKEN, user.ID_UTILISATEUR]))[0]
                    if (!notification && PUSH_NOTIFICATION_TOKEN) {
                              await query('INSERT INTO notification_tokens(ID_UTILISATEUR, DEVICE, TOKEN, IS_CITOYEN) VALUES(?, ?, ?, ?)', [user.ID_UTILISATEUR, DEVICE, PUSH_NOTIFICATION_TOKEN, user.PROFIL_ID == 7]);
                    }
                    res.status(200).json({
                              ...user,
                              TOKEN: generateToken({ ...user }, 3600 * 24 * 365 * 3),
                    });
          } catch (error) {
                    console.log(error);
                    res.status(500).send("Server error");
          }
};

const findConnectedUser = async (req, res) => {
          try {
                    var user = (await userModel.findBy("ID_UTILISATEUR", req.userId))[0] || {};
                    if (user?.PROFIL_ID == 6 || user?.PROFIL_ID == 12) {
                              var sqlQuery =
                                        "SELECT pe.ID_PSR_ELEMENT, pe.NOM, pe.PRENOM, pe.NUMERO_MATRICULE, pe.PHOTO, ";
                              sqlQuery += " pea.DATE_DEBUT, pea.DATE_FIN, paff.LIEU_EXACTE ";
                              sqlQuery += " FROM psr_elements pe ";
                              sqlQuery +=
                                        " LEFT JOIN psr_element_affectation pea ON pea.ID_PSR_ELEMENT = pe.ID_PSR_ELEMENT AND pea.IS_ACTIVE = 1 ";
                              sqlQuery +=
                                        " LEFT JOIN psr_affectatations paff ON paff.PSR_AFFECTATION_ID = pea.PSR_AFFECTATION_ID ";
                              sqlQuery +=
                                        " WHERE pe.ID_PSR_ELEMENT = ? ORDER BY pea.DATE_INSERT DESC LIMIT 1 ";
                              const psrElement = (await query(sqlQuery, [user.PSR_ELEMENT_ID]))[0];
                              user = { ...user, ...psrElement };
                    }
                    const { MOT_DE_PASSE, ...other } = user;
                    res.status(200).json(other);
          } catch (error) {
                    console.log(error);
                    res.status(500).send("Server error");
          }
};

module.exports = {
          login,
          create,
          findConnectedUser,
          logOut,
};
