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