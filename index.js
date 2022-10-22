const ghGetter = require("./src/app.js"),
  cliArgs = require('./src/cliArgs.js'),
  fm = require('./src/fileManager.js'),
  fs = require('fs'),
  path = require('path'),
  args = process.argv.slice(2), // the first two arguments are built in to nodejs
  filePath = process.env.github_sustain_filepath;

//this is set later, only IF we have a month
var pathForReports;
const argv = cliArgs.processArgs();
const month = "month" + argv.month;

if (cliArgs.validate(argv)) {
  if (argv.url) {
    pathForReports = fm.initFilePath(month, filePath);
    ghGetter.singleRepo(argv.url.trim(), month, filePath);
  } else {
    fs.readFile(argv.urlList, "utf8", function(err, data) {
      if (err) {
        console.error(err);
      } else {
        ghGetter.processMultipleFiles(data, month, filePath);
      }
    });
  }
}
