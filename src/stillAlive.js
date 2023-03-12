const { DateTime } = require("luxon");
const { initOcto, checkNoOfResults, countPaginatedResults, splitUrl } = require("./app.js");

////////// TBD THIS NEEDS TO RUN ISACTIVE AND WASACTIVE FOR EACH REPO, AND MAKE AN AGGREGATE REPORT


/**
 * Counts commits between two given dates. 
 * @param {string} config - an octokit config object, paramss for the github api
 * @param {string} anOctokit - this is optional and ususally only needs to be passed in if doing tests, where we don't want to get real api answers as they'll be variable and the test might fail due to latency. lol.
 **/
function countCommits(config, anOctokit) {
  config.owner = config.org;
  config.repo = config.repo.trim();
  const octokit = anOctokit || initOcto();
  return results = new Promise(function (resolve, reject) {
    checkNoOfResults(config, "commits").then(function (response) {
      countPaginatedResults(config, response, "commits").then(function (count) {
        resolve({
          commitCount: count,
          config: config,
          dateRetrieved: DateTime.now().toString()
        });
      });
    });
  });
}

module.exports = { countCommits: countCommits };