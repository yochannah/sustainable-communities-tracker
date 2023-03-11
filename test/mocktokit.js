//I'm so proud of this file name. Let's fake Octokit responses for our tests.

const mockData = require("./processedmockData.json"),
  mock_issue = require("./data_prep/mock_issue.js"),
  mock_pull = require("./data_prep/mock_pr.js"),
  mock_commit = require("./data_prep/mock_commit.js"),
  mock_labels = require("./data_prep/mock_labels.js"),
  mock_commit_2021_active = require("./data_prep/mock_commit_2021_active.js"),
  mock_commit_2021_inactive = require("./data_prep/mock_commit_2021_inactive.js"),
  mock_commit_2022_inactive = require("./data_prep/mock_commit_2022_active.js"),
  mock_commit_2022_active = require("./data_prep/mock_commit_2022_inactive.js");



//this response object  maps the serialised object (which is a modified real
// http response) to our mock octokit.

const responses = {
  "": mockData.repoInfo,
  "/commits": mock_commit,
  "/languages": mockData.languages,
  //3 and 4 are aggregate results and are not drawn on as mock test data
  "/community/profile": mockData.community,
  "/stats/contributors": mockData.contributors,
  "/labels": mock_labels,
  "/issues": mock_issue,
  "/pulls": mock_pull,
  "page": {
    "/pulls": mock_pull.page,
    "/issues": mock_issue.page,
    "/commits": {
      data: mock_commit.page.data,
      open: mock_commit.page.data,
      closed: mock_commit.page.data,
      all: mock_commit.page.data
    }
  },
  "state": {
    "/issues": mock_issue,
    "/pulls": mock_pull,
    "/commit": mock_commit
  },
  singleMethods: {
        //kitten_catten -     1,0
        //kitten_mitten -     0,1
        //ooga_bmaagal -      0,0
        //ooga_nistoveva -    1,1
        //ooga_nachuga -      1,1 //this goes through the default 334 commits route
        //sevivon_sovsovsov - 1,1 //this goes through the default 334 commits route
        //total_active        4,4
        //total_quiet         2,2
    kitten: {
      2021: {
        catten: mock_commit_2021_active,
        mitten: mock_commit_2021_inactive
      },
      2022: {
        catten: mock_commit_2022_inactive,
        mitten: mock_commit_2022_active
      }
    },
    ooga: {
      2021: {
        bmaagal: mock_commit_2021_inactive,
        nistoveva: mock_commit_2021_active,
      },
      2022: {
        bmaagal: mock_commit_2022_inactive,
        nistoveva: mock_commit_2022_active
      }
    }
  }
}

const testRepos = {
  kitten: [
    "catten",
    "mitten"],
  ooga: ["bmaagal",
    "nistoveva"
  ]
}

/**
 * 
 * **/
const isSingleMethodTestRepo = function (config) {
  let orgs = Object.keys(testRepos),
    isTestOrg = orgs.includes(config.owner),
    isTestRepo;
  if (isTestOrg) {
    isTestRepo = testRepos[config.owner].includes(config.repo);
  }
  return isTestOrg && isTestRepo;
}

const request = function (url, params) {
  try {
    //useful for debug
    //  console.log(`=== 🐙 === Testing
    //  |--- ${url}
    //  |--- with params: ${JSON.stringify(params)}`);
    // strip out the repeated bit of the URL
    let urlSnippet = url.split("GET /repos/{owner}/{repo}")[1],
      response = responses[urlSnippet];

    //some edge cases where we need alternate results. There's probably a tidier
    // way to do this.
    if (params.page) {
      response = responses.page[urlSnippet][params.state];
      //commits are neither open nor closed
      if (urlSnippet === "/commits") {
        response = responses.page[urlSnippet];
      }
    } else if (params.state) {
      response = responses[urlSnippet][params.state];
    }

    let isSingleMethodTest = isSingleMethodTestRepo(params);

    if (isSingleMethodTest) {
      let year = new Date(params.since);
      year = year.getFullYear();
    //  console.log('👾 params', params);
    //  console.log('👾 responses.singleMethods', responses.singleMethods);
      response = responses.singleMethods[params.owner][year][params.repo];
    }

    return response;

  } catch (error) {
    console.error("=== 🐙 === OY VEY", url, ", snip: ", "\n\n", error);
  }
}

exports.init = function () {
  console.log("=== 🐙 === Mock Octokit activated: we're using fake data and not the GitHub API");
  return {
    request: request
  };
}
