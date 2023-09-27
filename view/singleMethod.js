const methodRunner = require("./src/singleMethod.js").methodRunner,
  filePath = process.env.github_sustain_filepath,
  yargs = require('yargs'),
  cliArgs = require('./src/cliArgs.js');

const runner = new methodRunner("live", null, filePath);
const arguments = cliArgs.processSingleMethodArgs();
runner.runSingleMethod(arguments);
