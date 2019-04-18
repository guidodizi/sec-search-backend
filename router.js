var express = require("express");
var router = express.Router();

const controller = require("./controller");

router.get("/:company/:page?", controller.get_fillings);
router.get("*", controller.wrong_resquest);

module.exports = router;
