const {Observable } = require('./utils/observable');

const { Server } = require("socket.io");
const log4js = require("./services/log4j");
require("./utils/general");
const {readFile, appendFile,updateFile} = require('./services/FileServices');
const { createResponse } = require("./utils/io-message");
let logger = log4js.getLogger("server".toFixed(10));
logger.level = "debug";

const createServer = (httpServer) => {
    const io = new Server(httpServer, {
        /* options */
    });

    io.on("connection", (socket) => {
        let rmSubscriber;
        logger.info(`New WebSocket(id=${socket.id}) connection (nb connected clients:${io.engine.clientsCount})`);
        socket.emit("init");
        socket.on('subscribeExporters', (callback) => {
            logger.info(`WebSocket(id=${socket.id}) send subscribeExporters()`);
            rmSubscriber = exporter.onChange((value)=>{
                logger.info(`WebSocket(id=${socket.id}) send exporters()`);
                socket.emit("exporters", createResponse(value));
            })
            if (callback) callback(createResponse());
        });

        socket.on("updExporters", (data, callback)=>{
            const result = updateFile(data);
            exporter.setValue(result);
        });
        socket.on("disconnect", () => {
            logger.info(`user${socket.id} disconnected`)
            if (rmSubscriber)
                rmSubscriber();
        });
    });

    io.engine.on("connection_error", (err) => {
        logger.error(`WebSocket connection error`, err);
    });
};


const exporter = Observable(readFile());


module.exports = { createServer };
