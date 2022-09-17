const path = require('path'); 
const { env } = require('yargs');
require('dotenv').config({ path: path.join(__dirname, '/../../config/process.env'), debug: false, override: false})

const appProperties = {
    portDefault : 8080,
    maintenanceMode : false,
}


module.exports = { appProperties }
