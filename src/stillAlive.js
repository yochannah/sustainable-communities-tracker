////////// TBD THIS NEEDS TO RUN ISACTIVE AND WASACTIVE FOR EACH REPO, AND MAKE AN AGGREGATE REPORT


const { DateTime } = require("luxon");
const { initOcto, checkNoOfResults, countPaginatedResults, splitUrl } = require("./app.js");
const messages = require("./messages.js");
const errorHandler = require("./errorHandler.js");
const { isActive, wasActive } = require("./isActive.js");

function stillAlive(config, anOctokit) {
  return new Promise(function (resolve, reject) {

    let endDate = config.until,
      startDate = DateTime.fromISO(config.since);

    //if we're missing a start date for some reason
    // 12 months before the end date is good instead. 
    if (!startDate || startDate.invalid) {
      startDate = DateTime.fromISO(endDate);
      startDate = startDate.minus({ months: 12 });
    }
    endDate = startDate.plus({ months: 1 });
    startDate = startDate.toString();
    config.until = endDate;
    config.since = startDate;

    let is = isActive(config, anOctokit);
    let was = wasActive(config, anOctokit);

    Promise.allSettled([was, is]).then(function (values) {
      resolve({
        is: values[0],
        was: values[1]
      });
    }).catch(function (someError) {
      console.error(`A thing went wrong: ${someError}`);
      reject(someError);
    });
  });
}

module.exports = { stillAlive }