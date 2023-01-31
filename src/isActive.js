
const { DateTime } = require("luxon");
const { initOcto, checkNoOfResults, countPaginatedResults, splitUrl } = require("./app.js");
const messages = require("./messages.js");
const errorHandler = require("./errorHandler.js");

function isActive(config, anOctokit) {
  return results = new Promise(function (resolve, reject) {

    //skip the repo is there's a reason to
    if (!config.repo) { 
      console.log('👾 config', config);
      reject("no repo") }

    //otherwise. continue.
    config.owner = config.org;
    config.repo = config.repo.trim();
    //to check if the repo is "active", we check if there are any commits in the last month. 

    let endDate = config.until,
      startDate = DateTime.fromISO(endDate);
    startDate = startDate.minus({ months: 1 });
    startDate = startDate.toString();

    config.since = startDate;
    config.octokit = anOctokit || initOcto();

    checkNoOfResults(config, "commits").then(function (response) {
      countPaginatedResults(config, response, "commits").then(function (count) {
        resolve({
          isActive: count > 0,
          explanation: messages.reasons.hasActivity,
          commitCount: count,
          config: config,
          dateRetrieved: DateTime.now().toString()
        });
      }).catch(function (e) { errorHandler.generalError(e, "<-- count paginatedResults") })
    }).catch(function (e) { errorHandler.generalError(e, "<-- checknoofResults") });
  });
}

function wasActive(config, anOctokit) {
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
  return isActive(config, anOctokit);
}

module.exports = { isActive, wasActive };