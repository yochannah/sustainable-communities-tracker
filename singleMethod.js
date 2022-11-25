const { splitUrl } = require("./src/app.js");
const cliArgs = require('./src/cliArgs.js'),
  fm = require('./src/fileManager.js'),
  fs = require('fs'),
  { DateTime } = require("luxon"),
  path = require('path'),
  { countCommits } = require('./src/countCommits.js'),
  { isActive } = require('./src/isActive.js'),
  filePath = process.env.github_sustain_filepath;

const argv = cliArgs.processSingleMethodArgs();

//we don't want ppl to be able to run any random method. this is the "approved" list
const publicMethods = {
  "isActive": isActive,
  "countCommits": countCommits
};

/**
 * Counts commits between two given dates for a single github repo. 
 * @param {string} url - this is the url to run the check against. Should be a github repo url, e.g. https://github.com/myorg/ashinyrepo
 * @param {string} argv - the config passed in via commandline, more info available in the command line help of the cli config js file.
 * @param {string} filePath - where you want the report files to go. Will be created if it doesn't exist.
 **/
const singleRepo = function (url, argv, filePath) {
  new Promise(function (resolve, reject) {
    let config = splitUrl(url);
    config.since = DateTime.fromISO(argv.start);

    //end is optional - and if it's missing, we just want 12 months since the start date, which cna't be missing. 
    if (config.end) {
      config.until = DateTime.fromISO(argv.until);
    } else {
      config.until = config.since.plus({ months: 12 });
    }

    //However, what we don't want is for any of our dates to be in the future, because there are scenarios where we calculate one month backwards from our end date, and that could put the whole window in the future, which would be silly 😬
    //So, if end is in the future... WRONG! End is now today. 

    const now = DateTime.now()
    if (config.until > now) {
      config.until = now;
    }

    config.until = config.until.toString();
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

/**
 * Counts commits between two given dates for multiple repos. 
 * @param {string} data - this is a list of URLs in a text file, each URL on a new line. Each should be a github repo url, e.g. https://github.com/myorg/ashinyrepo
 * @param {string} filePath - where you want the report files to go. Will be created if it doesn't exist.
 **/
const processMultipleFiles = function (data, filePath) {
  let urls = data.split("\n");
  return urls.reduce(function (promise, singleUrl) {
    return promise.then(function () {
      return singleRepo(singleUrl, argv, filePath);
    });
  }, Promise.resolve());
}

/**
 * Runs a single named method on the approved list at the top - see publicMethods for full list of approved methods. No params, but takes command line args from the window. 
 * */
const runSingleMethod = function () {
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
};

runSingleMethod();