const { splitUrl } = require("./src/app.js");
const cliArgs = require('./src/cliArgs.js'),
  fm = require('./src/fileManager.js'),
  fs = require('fs'),
  { DateTime } = require("luxon"),
  path = require('path'),
  { countCommits } = require('./src/countCommits.js'),
  { isActive } = require('./src/isActive.js'),
  args = process.argv.slice(2), // the first two arguments are built in to nodejs
  filePath = process.env.github_sustain_filepath;

//this is set later, only IF we have a month
const argv = cliArgs.processSingleMethodArgs();
const publicMethods = {
  "isActive": isActive,
  "countCommits": countCommits
};

const singleRepo = function (url, argv, filePath) {
  new Promise(function (resolve, reject) {
    let config = splitUrl(url);
    config.since = DateTime.fromISO(argv.start);
    if (config.end) {
      config.until = DateTime.fromISO(argv.until);
    } else {
      config.until = config.since.plus({ months: 12 }).toString();
    }
    config.since = config.since.toString();
    //execute method for a single repo

    try {
      // idk why, I felt like it
      // I'm learning some Spanish words, so respuesta = response. 
      let respuesta = publicMethods[argv.method](config).then(function (result) {
        let fileName = path.join(filePath, config.org + "_" + config.repo + ".json");
        fm.saveFile(JSON.stringify(result), fileName);
        resolve();
      });
      return respuesta;
    }
    catch (e) {
      console.error(errors.general, e);
      reject();
    }
  });
}

const processMultipleFiles = function (data, filePath) {
  let urls = data.split("\n");
  return urls.reduce(function (promise, singleUrl) {
    return promise.then(function () {
      return singleRepo(singleUrl, argv, filePath);
    });
  }, Promise.resolve());
}

//only execute if a url or urls are provided
if (cliArgs.validate(argv)) {
  const pathForReports = fm.initFilePath(null, filePath);
  if (argv.url) {
    singleRepo(argv.url, argv, pathForReports);
  } else {
    fs.readFile(argv.urlList, "utf8", function (err, data) {
      if (err) {
        errorHandler.fileError(err, "error running" + argv.method, ownerRepo);
      } else {
        processMultipleFiles(data, pathForReports);
      }
    });
  }
}