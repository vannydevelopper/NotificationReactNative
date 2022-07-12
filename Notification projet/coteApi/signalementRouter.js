const express = require("express");
const signalementController = require("../controller/signalementController");
const notificationController = require("../controller/psr/notificationController")

const signalementRouter = express.Router();

signalementRouter.get("/gravites", signalementController.findGravites);
signalementRouter.post("/accidents", signalementController.createAccident);
signalementRouter.post("/embouteillages", signalementController.createEmbouteillage);
signalementRouter.post("/vols", signalementController.createVol);
signalementRouter.get("/couleurs", signalementController.findCouleurs);
signalementRouter.get("/chausse", signalementController.findChaussee);
signalementRouter.post("/incident", signalementController.createIncident);
signalementRouter.post("/autres", signalementController.createAutresSign);
signalementRouter.get("/vol", signalementController.findSignVol);
signalementRouter.get("/accident", signalementController.findSignAccident);
signalementRouter.get(
  "/embouteillage",
  signalementController.findSignEmbouteillage
);
signalementRouter.get("/incident", signalementController.findSignIncident);
signalementRouter.get("/autres", signalementController.findSignAutres);
signalementRouter.get("/alert_vehicules", signalementController.findSignAlertCivil);
signalementRouter.get("/alert_police", signalementController.findSignAlertCivilPolice);

signalementRouter.get("/affectations", signalementController.findAffectations);

signalementRouter.post("/send_notification",notificationController.createNotification);
signalementRouter.get("/reveive_notification",notificationController.findNotification);
signalementRouter.put("/update_notification",notificationController.updateNotification);
signalementRouter.get("/compte_notification",notificationController.compteNotification);
signalementRouter.post("/send_one_notification",notificationController.createOneNotification);



module.exports = signalementRouter;
