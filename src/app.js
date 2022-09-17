const express = require("express");
const path = require("path");
const appRouter = require("./routers/app");
const appFileRouter = require("./routers/appFile");

// -- definition of global settings --
global.__basedir = path.join(__dirname, "..");

console.log(__dirname);
console.log(__basedir);
console.log(__filename);

const maintenanceMiddleware = require("./middlewares/maintenance");
const logMiddleware = require("./middlewares/log");

// Create the Express application
const app = express();

// --- configuring express ---
app.use(express.json()); // parse requests of content-type - application/json

// --- set static directory files ---
const publicDirectoryPath = path.join(__basedir, "/public");
app.use(express.static(publicDirectoryPath)); // Mounts the static files middleware function

// --- Middlewares ---
app.use(maintenanceMiddleware);
app.use(logMiddleware);

// --- add routes ---
app.use(appRouter);
//app.use(appFileRouter);

module.exports = app;
