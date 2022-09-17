const express = require("express");
const router = new express.Router();
const log4js = require("../services/log4j");
let logger = log4js.getLogger("exporters");
const {readFile, appendFile,updateFile} = require('../services/FileServices');

router.get("/getFileExporters", (req,res) => {
    logger.info(`send exporters from file`);
    const result = readFile();
    res.send(result);
})

router.post("/addFileExporter", (req,res) => {
    logger.info(`add exporter to file`);
    console.log(req.body);
    appendFile(JSON.stringify(req.body));
    res.send('');
})

router.post("/updFileExporter", (req,res) => {
    logger.info(`update exporter to file`);
    updateFile(JSON.stringify(req.body));
    res.send('');
})


module.exports = router;