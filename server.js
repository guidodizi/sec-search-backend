const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

const router = require("./router");

const app = express();
app.use(cors());
app.use(helmet());
app.use(compression());

app.use("/", router);
app.use(function(err, req, res, next) {
  console.error(err);
  const error_message = err.message || "An internal server error has occured";
  res.status(err.status || 500).json({ result: {}, errors: [error_message] });
});

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server up & running on port: ${process.env.PORT || 5000}`)
);
