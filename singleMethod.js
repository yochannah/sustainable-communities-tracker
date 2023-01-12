const { splitUrl } = require("./src/app.js");
const errorHandler = require("./src/errorHandler.js");
const errors = require("./src/errors.js");
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

const aggregateSummaries = {
  isActive: function (results, data) {
    let active = 0, quiet = 0;
    results.map(function (result) {
      if (result.isActive) {
        active++;
      } else {
        if (!result.isActive) {
          quiet++;
        } else {
          console.log("something weird happened. Maybe an error?", result);
        }
      }
    });
    return {
      isActive: {
        active: active,
        quiet: quiet
      }
    }
  },
  countCommits: function (results, data) {
    var commitCount = [];
    results.map(function (result) {
      if (result.commitCount) {
        commitCount.push(parseInt(result.commitCount, 10));
      }
      else {
        console.log('👾 error for ', result.config.org, result.config.repo);
      }
    });
    //we want a numerically sorted list, not a string-sorted list. 
    return commitCount.sort((a, b) => (a - b));
  }
};

/**
 * Counts commits between two given dates for a single github repo. 
 * @param {string} url - this is the url to run the check against. Should be a github repo url, e.g. https://github.com/myorg/ashinyrepo
 * @param {string} argv - the config passed in via commandline, more info available in the command line help of the cli config js file.
 * @param {string} filePath - where you want the report files to go. Will be created if it doesn't exist.
 **/
const singleRepo = function (url, argv, filePath) {
  let config = prepareConfig(url, argv, 12);

  return new Promise(function (resolve, reject) {
    // we've been passed a nonexistent method via the command line,
    // or it's not configured in publicmethods. 
    if (!(typeof publicMethods[argv.method])) {
      console.debug(`There's no method to execute, skipping ${url}`);
      return;
    }

    try {
      // idk why, I felt like it
      // I'm learning some Spanish words, so respuesta = response. 
      let respuesta = publicMethods[argv.method](config).then(function (result) {
        if (!result) {
          console.debug(`No response for ${config.url}`);
          reject();
        } else {
          let fileName = path.join(filePath, `${argv.method}_${config.org}_${config.repo}.json`);
          //  console.debug(`--> Saving ${url} to ${fileName}`)
          fm.saveFile(JSON.stringify(result), fileName);
          resolve(result);
        }
      }).catch(function (e) {
        errorHandler.generalError(e, `Error in config or saving to file? ${url}`);
      });
      return respuesta;
    }
    catch (e) {
      errorHandler.generalError(e, errors.general);
      reject(e);
    }
  });
}

/**
 * Runs a method between two given dates for multiple repos. 
 * @param {string} data - this is a list of URLs in a text file, each URL on a new line. Each should be a github repo url, e.g. https://github.com/myorg/ashinyrepo
 * @param {string} filePath - where you want the report files to go. Will be created if it doesn't exist.
 **/
const processMultipleUrls = function (data, filePath) {
  let urls = data.split("\n");
  return urls.reduce(function (promise, singleUrl) {
    return promise.then(function () {
      return singleRepo(singleUrl, argv, filePath);
    }).catch(errorHandler.generalError(url, "<-- No likey processing a url"));
  }, Promise.resolve());
}

/**
 * Runs a method between two given dates for multiple repos. 
 * @param {string} data - this is a set of rows in a tsv, see same file for more info.
 * @param {string} filePath - where you want the report files to go. Will be created if it doesn't exist.
 **/
const processMultipleRows = function (data, filePath) {
  let response = data.reduce(function (accumulator, row) {
    if (row.urls) {
      let config = splitUrl(row.urls);
      if (config) {
        config.method = argv.method;
        //data the first survey response was recorded
        config.start = row.RecordedDate;
        //date the final survey response was recorded
        config.end = row.EndDate;
        accumulator.push(singleRepo(row.urls, config, filePath));
      }
      return accumulator;
    }
    else {
      console.debug("Yo, what did you do?", row);
    }
  }, []);
  return response;
}

/**
 * Runs a single named method on the approved list at the top - see publicMethods for full list of approved methods. No params, but takes command line args from the window. 
 * */
const runSingleMethod = function () {
  let report = {};
  if (cliArgs.validate(argv)) {
    const pathForReports = fm.initFilePath(null, filePath);
    if (argv.url) {
      //run checks on one repo
      singleRepo(argv.url, argv, pathForReports);
      report.methodType = "single repo";
      report.url = argv.url;
      report.method = argv.method;
      report.pathSaved = pathForReports;
    } else {
      if (argv.urlList) {
        report.methodType = "url list";
        report.urls = [];
        report.method = argv.method;
        report.pathSaved = pathForReports;
        //read a basic txt file with one url per line. 
        fs.readFile(argv.urlList, "utf8", function (err, data) {
          if (err) {
            errorHandler.fileError(err, "error running" + argv.method, ownerRepo);
          } else {
            //this does the same as singlerepo, but as many times as needed per url
            let urls = processMultipleUrls(data, pathForReports);
            Promise.all(urls).then(function (response) {
              console.log(aggregateReportFromResults(response, tsv.data, argv.method));
            });
          }
        });
      } else {
        //this should be the tsv, with more complex formatting than the single-url-per-line. 
        fm.readTsv(argv.tsvFile).then(function (tsv) {
          let results = processMultipleRows(tsv.data, pathForReports);
          Promise.all(results).then(function (response) {
            console.log(aggregateReportFromResults(response, tsv.data, argv.method));
          });


        });
      }
    }
  }
};

function sanitiseDate(dateString) {
  let response = dateString.split(" ");
  if (response.length > 1) {
    return response[0];
  }
  else {
    return dateString;
  }
}

/**
 * 
 * */
function prepareConfig(url, argv, months) {

  //separate repo and org from the URL
  let config = splitUrl(url);

  //convert startdate into a datetime. 
  config.since = DateTime.fromISO(sanitiseDate(argv.start));

  if (config.since.invalid) {
    errorHandler.generalError(config.since, `start date was invalid: ${argv.start}`);
  }

  //end is optional - and if it's missing, we just want up to N months since the start date, which can't be missing. 
  if (config.end) {
    config.until = DateTime.fromISO(sanitiseDate(argv.until));
  } else {
    config.until = config.since.plus({ months: months });
  }

  //However, what we don't want is for any of our dates to be in the future, because there are scenarios where we calculate one month backwards from our end date, and that could put the whole window in the future, which would be silly 😬
  //So, if end is in the future... WRONG! End is now today. 

  const now = DateTime.now()
  if (config.until > now) {
    config.until = now;
  }

  //github wants ISO strings, not objects. 
  config.until = config.until.toISO();
  config.since = config.since.toISO();

  return config;
}


function getDatesOfChecks(data) {
  //record the span of dates these checks cover.
  var datesOfChecks = {
    start: DateTime.now(),
    end: DateTime.fromISO("1972-01-01")
  }
  data.map(function (result) {
    //I tried from ISO but it DOESN'T like the space in the datetime. 
    let rStart = DateTime.fromSQL(result.RecordedDate);
    let rEnd = DateTime.fromSQL(result.EndDate);

    if (rStart < datesOfChecks.start) { datesOfChecks.start = rStart; }
    if (result.EndDate && (rEnd > datesOfChecks.end)) { datesOfChecks.end = rEnd; }
  });

  datesOfChecks.start = datesOfChecks.start.toISO();
  datesOfChecks.end = datesOfChecks.end.toISO();
  return datesOfChecks;
}

function aggregateReportFromResults(results, data, method) {
  try {
    let checks = aggregateSummaries[method](results, data);
    // console.log('😲 results', results);
    // console.log('👾 data', data);



    return {
      urlsSubmitted: data.length,
      successfulResults: results.length,
      checks: checks,
      dateGathered: DateTime.now().toISO(),
      dateChecksCovered: getDatesOfChecks(data)
    };
  } catch (e) {
    console.error('😱 Error running method', e);
  }
}

runSingleMethod();