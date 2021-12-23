//I'm so proud of this file name. Let's fake Octokit responses for our tests.

const mockData = require("./processedmockData.json"),
  mock_issue = require("./data_prep/mock_issue.js"),
  mock_pull = require("./data_prep/mock_pr.js"),
  mock_commit = require("./data_prep/mock_commit.js"),
  mock_labels = require("./data_prep/mock_labels.js");

// console.log("<<🥕MOCK ISSUE");
// console.log(mock_issue);
// console.log("🥕>>");

//this response object  maps the serialised object (which is a modified real
// http response) to our mock octokit.

var responses = {
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
  }

}

const request = function(url, params) {
  try {
    //useful for debug
//    console.log("=== 🐙 === Testing " + url + "\n |--- with params: " +
//      JSON.stringify(params));
    //strip out the repeated bit of the URL
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
    return response;

  } catch (error) {
    console.error("=== 🐙 === OY VEY", url, ", snip: ", "\n\n", error);
  }
}

exports.init = function() {
  console.log("=== 🐙 === Mock Octokit activated: we're using fake data and not the GitHub API");
  return {
    request: request
  };
}
