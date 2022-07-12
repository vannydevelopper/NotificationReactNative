const userModel = require("../model/userModel");
const requireAssureur = async (request, response, next) => {
  if (request.userId) {
    var user = (await userModel.findBy("ID_UTILISATEUR", request.userId))[0];
    if (user.PROFIL_ID == 2) {
      next();
    } else {
      response.status(401).json({
        errors: {
          main: "Vous n'etes pas autorisé a se connecter",
        },
      });
    }
  }
};

module.exports = requireAssureur;
