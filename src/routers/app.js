const express = require("express");
const router = new express.Router();
const log4js = require("../services/log4j");
let logger = log4js.getLogger("exporters");

// --- Redirect to html ---
router.get("", (req, res) => {
  logger.info(`access to 'main' page`);
  res.redirect("/blackList.html");
});

module.exports = router;
