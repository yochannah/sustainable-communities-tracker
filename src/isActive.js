const {
    Octokit
  } = require("@octokit/core");
  const {
    throttling
  } = require("@octokit/plugin-throttling");
  const parse_headers = require('parse-link-header');
  const fs = require('fs');
  const errorHandler = require('./errorHandler.js');
  const path = require('path'),
    errors = require('./errors.js'),
    fm = require('./fileManager.js'),
    messages = require('./messages.js');
  const { initOcto, checkNoOfResults, countPaginatedResults, splitUrl } = require("./app.js");
  
  var octokit;

  async function isActive(repository, org, anOctokit) {
    let config = {},
    state = "all",
    label = null;
    config.owner = org;
    config.repo = repository.trim();
    octokit = anOctokit || initOcto();

  //checkNoOfResults function(config, endpoint, state, label)
    checkNoOfResults(config, "commits", state, label).then(function(response){
    console.log('%cresponse','background-color:aqua; font-weight:bold',response);
   // countPaginatedResults(config, interimResponse[1], "commits");
  });

}

module.exports = {isActive : isActive};

  // interimResponse = await Promise.all([
  //   repoInfo, //0
  //   commitNumber, //1
  //   locCount, //2
  //   allPrsAndIssues, //3
  //   closedPrsAndIssues, //4
  //   community, //5
  //   contributors, //6
  //   labels, //7
  //   timeToMerge //
  // ]),

  // commitCount: await countPaginatedResults(config, interimResponse[1], "commits"),
        