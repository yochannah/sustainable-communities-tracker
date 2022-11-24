const { splitUrl } = require("./src/app.js");

const ghGetter = require("./src/app.js"),
  cliArgs = require('./src/cliArgs.js'),
  fm = require('./src/fileManager.js'),
  fs = require('fs'),
  path = require('path'),
  {isActive} = require('./src/isActive.js'),
  args = process.argv.slice(2), // the first two arguments are built in to nodejs
  filePath = process.env.github_sustain_filepath;

//this is set later, only IF we have a month
var pathForReports;
const argv = cliArgs.processSingleMethodArgs();
const month = "month" + argv.month;

const publicMethods = {
  "isActive" : isActive
};

if (cliArgs.validate(argv)) {
  if (argv.url) {
    let config = splitUrl(argv.url);
   // pathForReports = fm.initFilePath(month, filePath);
   console.log('🔽 🔽 🔽');
   console.log(config)
   console.log('↗️  🔼 ↖️');
   
    publicMethods[argv.method](config.repo, config.org);
    
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
