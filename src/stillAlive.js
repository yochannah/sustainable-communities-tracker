////////// TBD THIS NEEDS TO RUN ISACTIVE AND WASACTIVE FOR EACH REPO, AND MAKE AN AGGREGATE REPORT
const { DateTime } = require("luxon");
const { initOcto, checkNoOfResults, countPaginatedResults, splitUrl } = require("./app.js");
const messages = require("./messages.js");
const errorHandler = require("./errorHandler.js");
const { isActive, wasActive } = require("./isActive.js");
const Statuses = require("./statuses.js");
const clone = require("./clone.js");

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

    //the dates in the config are the study start and the study end
    // but for was active and IS active, we want a month at 
    // the start and a month at the end.

    let studyEndDate = DateTime.fromISO(config.until),
      studyStartDate = DateTime.fromISO(config.since);

    //if we're missing a start date for some reason
    // 12 months before the end date is good instead. 
    if (!studyStartDate || studyStartDate.invalid) {
      studyStartDate = studyEndDate.minus({ months: 12 });
    }

    let dates = {
      was: {
        start: studyStartDate,
        end: studyStartDate.plus({ months: 1 })
      },
      is: {
        start: studyEndDate,
        end: studyEndDate.minus({ months: 1 })
      }
    };

    let wasConfig = clone(config), 
    isConfig = clone(config);

    wasConfig.since = dates.was.start;
    wasConfig.until = dates.was.end; 
    isConfig.since = dates.is.start;
    isConfig.until = dates.is.end; 

    let is = isActive(isConfig, anOctokit);
    let was = wasActive(wasConfig, anOctokit);

    Promise.allSettled([was, is]).then(function (values) {
      let resolvedIs = values[0].value, resolvedWas = values[1].value;
      let theStatus = prepareStatus(resolvedIs, resolvedWas),
        response = {
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
        }
      console.log('👾 response', response);
      resolve(response);
    }).catch(function (someError) {
      console.error(`A thing went wrong: ${someError}`);
      reject(someError);
    });
  });
}

module.exports = { stillAlive }