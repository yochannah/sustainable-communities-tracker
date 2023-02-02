const { splitUrl } = require("./app.js");
const errorHandler = require("./errorHandler.js");
const errors = require("./errors.js");
const fm = require('./fileManager.js'),
    fs = require('fs'),
    { DateTime } = require("luxon"),
    { countCommits } = require('./countCommits.js'),
    { isActive, wasActive } = require('./isActive.js');

/** 
 * we don't want ppl to be able to run any random method. this is the "approved" list
 * @constant
    @type {Object.<string>}
*/
const publicMethods = {
    "isActive": isActive,
    "wasActive": wasActive,
    "countCommits": countCommits
};

const aggregateSummaries = {
    /**
     * Function to summarise results from a SET of isActive queries. Criterion for "quiet" is no activity in the last month.
     * @param {Array.<Object>} results an array of IsActive results
     * @param {null} data
     * @returns {Object.<number>} number of active and quiet repos in the result set. 
     * **/
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
    /**
   * Function to summarise results from a SET of commit count queries. 
   * @param {Array.<Object>} results an array of countCommits results
   * @param {null} data
   * @returns {Array.<number>} sorted Array showing how many commits in the repo for the given period. 
   * **/
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
    },
    wasActive: function (results, data) { return aggregateSummaries.isActive(results, data); }
};

/**
 * Counts commits between two given dates for a single github repo. 
 * @param {string} url - this is the url to run the check against. Should be a github repo url, e.g. https://github.com/myorg/ashinyrepo
 * @param {string} argv - the config passed in via commandline, more info available in the command line help of the cli config js file.
 * @param {string} filePath - where you want the report files to go. Will be created if it doesn't exist.
 * @param {Object | null} anOctokit optional, mostly used to pass a mock when testing
 * @returns {Promise} resolves or rejects based on a successful API call
 **/
const singleRepo = function (url, argv, filePath, anOctokit) {
    let method = argv.method;
    let config = prepareConfig(url, argv, 12, method, filePath);
    return new Promise(function (resolve, reject) {
        // we've been passed a nonexistent method via the command line,
        // or it's not configured in public methods. 
        if (!publicMethods.hasOwnProperty(method)) {
            let err = `There's no method to execute, ${method} is not valid`;
            // errorHandler.generalError(method, err);
            reject(err);
        }
        try {
            // idk why, I felt like it
            // I'm learning some Spanish words, so respuesta = response. 
            let respuesta = publicMethods[method](config, anOctokit).then(function (result) {

                if (!result) {
                    console.debug(`No response for ${config.url}`);
                    reject();
                } else {
                    let fileName = fm.getFileNameSingleMethod(config, "singleResult");
                    console.log(`--> Saving ${url} to ${fileName}`)
                    fm.saveFile(result, fileName);
                    resolve(result);
                }
            }).catch(function (e) {
                errorHandler.generalError(e, `Error in config or saving to file? ${url}`);
            });
            return respuesta;
        }
        catch (e) {
            errorHandler.generalError(e, errors.general);
            reject(e); // does this ever happen? 
        }
    });
}

/**
 * Runs a method between two given dates for multiple repos for single-url-per-line textfiles. 
 * @param {string} data - this is a list of URLs in a text file, each URL on a new line. Each should be a github repo url, e.g. https://github.com/myorg/ashinyrepo
 * @param {string} filePath - where you want the report files to go. Will be created if it doesn't exist.
 * @param {Object | null} anOctokit optional - communicator module. useful for testing.
 **/
const processMultipleUrls = function (data, filePath, anOctokit) {
    if (!publicMethods.hasOwnProperty(method)) {
        let err = `There's no method to execute, ${method} is not a valid public method`;
        return Promise.reject(err);
    } else {

        let urls = data.split("\n");
        return urls.reduce(function (promise, singleUrl) {
            return promise.then(function () {
                return singleRepo(singleUrl, argv, filePath, anOctokit);
            }).catch(errorHandler.generalError(url, "<-- No likey processing a url"));
        }, Promise.resolve());
    }
}

/**
 * Runs a method between two given dates for multiple repos.  
 * @param {string} data - this is a set of rows in a tsv, see same file for more info.
 * @param {string} filePath - where you want the report files to go. Will be created if it doesn't exist.
 * @param {string} method
 * @param {Object | null} anOctokit optional - communicator module. useful for testing.

 **/
const processMultipleRows = function (data, filePath, method, anOctokit) {
    let response;
    if (!publicMethods.hasOwnProperty(method)) {
        let err = `🥾 There's no method to execute, ${method} is not a valid public method`;
        response = Promise.reject(err);
    } else {
        response = data.reduce(function (accumulator, row) {
            if (row.urls) {
                let config = splitUrl(row.urls);
                if (config) {
                    config.method = method;
                    //data the first survey response was recorded
                    config.start = row.RecordedDate;
                    //date the final survey response was recorded
                    config.end = row.EndDate;
                    let thisRow = singleRepo(row.urls, config, filePath, anOctokit)
                    accumulator.push(thisRow);
                }
                return accumulator;
            }
            else {
                console.debug("Yo, what did you do?", row);
                return Promise.reject();
            }
        }, []);
    }
    return response;
}

/**
 * Runs a single named method on the approved list at the top - see publicMethods for full list of approved methods. No params, but takes command line args from the window. 
 * @param {Object} config - a command-line argument set to run the methods. See cliArgs.js for more info. 
 * @emits Saves a file with the report on the aggregate results, and one file per repo iwth repo-specific results.
 * @param {Object | null} anOctokit optional - communicator module. useful for testing.
 * */
const runSingleMethod = function (config, anOctokit, filePath) {
    return new Promise(function (resolve, reject) {
        let finalReport;

        const pathForReports = fm.initFilePath(null, filePath);
        if (config.url) {
            //run checks on one repo
            singleRepo(config.url, config, pathForReports, anOctokit);
            finalReport = `One repo only, ${config.url}`;
        } else {
            if (config.urlList) {
                //one url per line
                finalReport = checkType.urlList(config, pathForReports, anOctokit);
            } else {
                //this should be the tsv, with more complex formatting than the single-url-per-line. 
                finalReport = checkType.tsv(config, pathForReports, anOctokit);
            }
        }
        finalReport.then(function (results) {
            let thePath = fm.getFileNameSingleMethod(config, "report");
            fm.saveFile(results, thePath);
        }).catch(function (result) {
            reject(new `Something went wrong ${result}`);
        });
        resolve(finalReport);
    });
};

const checkType = {
    /**
     * @param {Object} argv cli argument set
     * @param {string} pathForReports path to save responses.
     * @param {Object | null} anOctokit optional - communicator module. useful for testing.
     * */
    tsv: function (argv, pathForReports, anOctokit) {
        // be warned: this method usually works, but failures can be silent and 
        // it's driving me lightly bonkers. As you can probable see from 
        // multiple rejects and catch blocks. 
        try {
            if (!argv.tsvFile) { throw `SOMETHING BAD HAPPENED, file is null` } else {

            };
            return fm.readTsv(argv.tsvFile).then(function (tsv) {
                let results = processMultipleRows(tsv.data, pathForReports, argv.method, anOctokit);
                if (results.iterable) {
                    return Promise.all(results).then(function (response, x, y) {
                        let report = aggregateReportFromResults(response, tsv.data, argv.method);
                        return report;
                    }).catch(function (e) {
                        return Promise.reject("Hm, something went wrong iterating through result promises");
                    });
                } else {
                    return Promise.reject("ERROR HANDLE HERE>>>>>");
                }
            });
        } catch (e) {
            throw `SOMETHING BAD HAPPENED ${e}`;
        }
    },
    /**
   * @param {Object} argv cli argument set
   * @param {string} pathForReports path to save responses.
   *  * @param {Object | null} anOctokit optional - communicator module. useful for testing.
  
   * */
    urlList: function (argv, pathForReports, anOctokit) {
        //read a basic txt file with one url per line. 
        fs.readFile(argv.urlList, "utf8", function (err, data) {
            if (err) {
                errorHandler.fileError(err, "error running" + argv.method, ownerRepo);
            } else {
                //this does the same as singlerepo, but as many times as needed per url
                let urls = processMultipleUrls(data, pathForReports, anOctokit);
                return Promise.all(urls).then(function (response) {
                    return aggregateReportFromResults(response, tsv.data, argv.method);
                });
            }
        });

    }
}

/**  Some of our dates are in date-time format, but we only want the day. This returns JUST the date.
* @param {string} date that starts with YYYY-MM-DD and MAY have a time as well. 
* @returns {string} in YYYY-MM-DD format
* */
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
 * Checks data, tidies up missing or invalid values for the data and url parameters
 * @param {string} url to run the check against
 * @param {Object.<string>} argv cli argument set
 * @param {number} months num of months this check should run across, if no end date is given.
 * @returns {Object} tidied up values 
 * */
function prepareConfig(url, argv, months, method, filePath) {

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

    config.method = method;
    config.filePath = filePath;

    return config;
}

/**
 * Given a set of checks to run with their start and end dates, return the earliest start date and the latest end date
 * @param data a set of urls to query
 * @returns {Object.<Date>} start and end date
*/
function getDatesOfChecks(data) {
    //record the span of dates these checks cover.
    var datesOfChecks = {
        start: DateTime.now(),
        end: DateTime.fromISO("1972-01-01") // this is an arbitrary long-ago date. 
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

/**
 * @param {array} results an array of results - one method against multiple repos. 
 * @param {array} originalQuery - the urls against which the checks were run
 * @param {string} method the name of the method run 
 * @returns {object} a report on the number of urls tested successfully and a summary of the results. This will vary depending on the `method` passed
 * **/
function aggregateReportFromResults(results, originalQuery, method) {
    try {
        let checks = aggregateSummaries[method](results, originalQuery);

        return {
            urlsSubmitted: originalQuery.length,
            successfulResults: results.length,
            checks: checks,
            dateGathered: DateTime.now().toISO(),
            dateChecksCovered: getDatesOfChecks(originalQuery)
        };
    } catch (e) {
        console.error('😱 Error running method', e);
    }
}

class methodRunner {

    environment;
    octokit;
    filePath;
    config;

    constructor(environment, anOctokit, filePath, cliArgs) {
        if (environment) {
            this.environment = environment;
            if (!this.isEnvValid(this.environment)) {
                throw new Error(`${environment} is not a valid environment type`);
            }
        }
        if (anOctokit) {
            this.octokit = anOctokit;
        }
        if (filePath) {
            this.filePath = filePath;
        }

        if (this.environment === "live") {
            this.config = cliArgs;
            console.debug(`👩🏽‍💻 Environment -> Live. `);
        }

        if (this.environment === "test") {
            console.debug(`🎮 Environment -> TEST. `);
        }

    }

    isEnvValid = function () {
        let validEnvs = ["test", "live"];
        //must be in the list to be valid;
        return (validEnvs.indexOf(this.environment) >= 0);
    }
    runSingleMethod = function (config) {
        //this allows us to manage test vs prod params easily
        let params = (config || this.config)
        return runSingleMethod(params, this.octokit, this.filePath);
    }
}

module.exports = { methodRunner };