
const { DateTime } = require("luxon");
const { initOcto, checkNoOfResults, countPaginatedResults, splitUrl } = require("./app.js");

function isActive(config, anOctokit) {
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

module.exports = { isActive };