const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

const controller = require("./controller");

const app = express();
app.use(cors());
app.use(helmet());
app.use(compression());

app.get("/:company/:page?", controller.get_fillings);
app.get("*", controller.wrong_resquest);

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server up & running on port: ${process.env.PORT || 5000}`)
);
