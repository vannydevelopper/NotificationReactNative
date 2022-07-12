const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const plaqueRouter = require("./routes/plaqueRouter");
const permisOneRouter = require("./routes/permisRouteOne");
const userRouter = require("./routes/usersRouter");
const permisRouter = require("./routes/permisRoute");
const histoRouter = require("./routes/histoRoutes");
const declarationsRouter = require("./routes/declarationsRouter");
const controleRouter = require("./routes/controleRouter");
const assuranceRouter = require("./routes/assuranceRouter");
const InfraRouter = require("./routes/infactionRoutes");
const payementRouter = require("./routes/payementRouter");
const bindUser = require("./middleware/bindUser");
const alertRouter = require("./routes/alertRouter");
const fileUpload = require("express-fileupload");
const signalementRouter = require("./routes/singalementRouter");
const immaPermisRouter = require("./routes/ImmatriPermisRoutes");
const voyageRouter = require("./routes/voyageRoutes");
const systRouter = require("./routes/systRouter");
const psrRouter = require("./routes/psrRouter");
const requireAuth = require("./middleware/requireAuth");

const app = express();

dotenv.config({ path: path.join(__dirname, "./.env") });

app.use(cors());
app.use(express.static(__dirname + "/public"));
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all("*", bindUser);
app.use("/plaques", plaqueRouter);
app.use("/permis", permisRouter);
app.use("/numeroPermis", permisOneRouter);
app.use("/permisOne", permisRouter);
app.use("/opj_declarations", declarationsRouter);
app.use("/controles", controleRouter);
app.use("/assurances", assuranceRouter);
app.use("/historiques", histoRouter);
app.use("/infractions", InfraRouter);
app.use("/users", userRouter);
app.use("/payements", payementRouter);
app.use("/alerts", alertRouter);

app.use("/signalements", signalementRouter);
app.use("/immaPermis", immaPermisRouter);
app.use("/tracking", voyageRouter);
app.use("/syst", systRouter);

app.use("/psr", requireAuth, psrRouter);

app.all("*", (req, res) => {
  res.status(404).json({
    errors: {
      main: "Page non trouvé",
    },
  });
});

const port = process.env.PORT || 8000;

app.listen(port, async () => {
  console.log("server is running on port: " + port);
});
