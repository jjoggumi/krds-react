const fs = require("fs");
const path = require("path");
const { generateApi } = require("swagger-typescript-api");

module.exports = ({temp_path, hooks, swagger_json}) => generateApi({
  output: path.join(__dirname, temp_path),
  input: path.join(__dirname, swagger_json),
  templates: path.join(__dirname, "./templates"),
  modular: true,
  hooks
});