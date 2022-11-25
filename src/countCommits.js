const {
  Octokit
} = require("@octokit/core");
const {
  throttling
} = require("@octokit/plugin-throttling");
const parse_headers = require('parse-link-header');
const fs = require('fs');
const errorHandler = require('./errorHandler.js');
const { DateTime } = require("luxon");
const path = require('path'),
  errors = require('./errors.js'),
  fm = require('./fileManager.js'),
  messages = require('./messages.js');
const { initOcto, checkNoOfResults, countPaginatedResults, splitUrl } = require("./app.js");

var octokit;
/**
 * Counts commits between two given dates. 
 * @param {string} config - an octokit config object, paramss for the github api
 * @param {string} anOctokit - this is optional and ususally only needs to be passed in if doing tests, where we don't want to get real api answers as they'll be variable and the test might fail due to latency. lol.
 **/
function countCommits(config, anOctokit) {
  config.owner = config.org;
  config.repo = config.repo.trim();
  octokit = anOctokit || initOcto();
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