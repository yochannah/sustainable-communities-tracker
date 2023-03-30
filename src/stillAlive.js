////////// TBD THIS NEEDS TO RUN ISACTIVE AND WASACTIVE FOR EACH REPO, AND MAKE AN AGGREGATE REPORT


const { DateTime } = require("luxon");
const { initOcto, checkNoOfResults, countPaginatedResults, splitUrl } = require("./app.js");
const messages = require("./messages.js");
const errorHandler = require("./errorHandler.js");
const { isActive, wasActive } = require("./isActive.js");
const Statuses = require("./statuses.js");

function prepareStatus(is, was) {
  // console.log('👾 is', is);
  // console.log('👾 wass', was);
  let status,
    isActive = is.isActive,
    wasActive = was.isActive;

  if (wasActive && isActive) {
    status = Statuses.ONGOING;
  }
  else if (wasActive && !isActive) {
    status = Statuses.DECLINED;
  }
  else if (!wasActive && !isActive) {
    status = Statuses.INACTIVE;
  }
  else if (!wasActive && isActive) {
    status = Statuses.ACTIVATED;
  }
  return status;
}

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
      let resolvedIs = values[0], resolvedWas = values[1];
      let theStatus = prepareStatus(resolvedIs, resolvedWas);
      resolve({
        repo: {
          org: config.org,
          repo: config.repo
        },
        activityStatus: theStatus,
        details: {
          is: resolvedIs,
          was: resolvedWas,
          config: config
        }
      });
    }).catch(function (someError) {
      console.error(`A thing went wrong: ${someError}`);
      reject(someError);
    });
  });
}

module.exports = { stillAlive }