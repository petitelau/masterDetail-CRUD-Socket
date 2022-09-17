import { io } from "./client-dist/socket.io.esm.min.js";
import {ListController, SelectionController} from "./controller.js";
import {Exporter, NoExporter} from "./exporter.js";
import {DetailView, MasterView} from "./exporter.js";
import * as Log from "./utils/log4js.js";

Log.setLogLevel(Log.LEVEL_DEBUG);

const socket = io();
let listController

const startExporter = (exporters) => {

    listController      = ListController(Exporter, exporters, socket);
    const selectionController = SelectionController(NoExporter);

    MasterView(listController, selectionController, document.getElementById('masterContainer'));
    DetailView(selectionController, document.getElementById('detailContainer'));

    listController.addItems();
    document.getElementById('plus').onclick    = _ => listController.addModel();

}

let init=true
socket.on("init", () => {
        Log.debug('init received');
        socket.emit('subscribeExporters', ({data, error}) => {
            Log.debug('callback subscription');
            if (error) {
                Log.error("Error loading exporters: " + error);
                return;
            }
        })
})
socket.on("exporters", ({data, error})=>{
    if (error) {
        Log.error("Error receiving exporters: " + error);
        return;
    }
    Log.debug(JSON.stringify(data));
    if (init ) {
        startExporter(data);
        init=false
    }
    else {
        console.log('updating', data)
        listController.addNewItems(data);
    }
})
