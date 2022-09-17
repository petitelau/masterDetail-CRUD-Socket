const path = require("path");

module.exports = {
  filename: `${path.join(__dirname, "../../logs/")}exporters.log`,
  level: "info",
};
