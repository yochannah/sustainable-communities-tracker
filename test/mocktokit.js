//I'm so proud of this file name. Let's fake Octokit responses for our tests.

const mockData = require("./processedmockData.json"),
  mock_issue = require("./mock_issue.js").issues,
  mock_pull = require("./mock_pr.js").prs,
  mock_commit = require("./mock_commit.js")

//this response object  maps the serialised object (which is a modified real
// http response) to our mock octokit.


var responses = {
  "": mockData[0],
  "/commits": mockData[1],
  "/languages": mockData[2],
  //3 and 4 are aggregate results and are not drawn on as mock test data
  "/community/profile": mockData[5],
  "/stats/contributors": mockData[6],
  "/labels": mock_issue.labels,
  "/issues": mock_issue.open,
  "/pulls": mock_pull.open,
  "page": {
    "/pulls": mock_pull.page,
    "/issues": mock_issue.page,
    "/commits": {
      open: mock_commit,
      closed: mock_commit,
      all: mock_commit
    }
  },
  "state": {
    "/issues": mock_issue,
    "/pulls": mock_pull
  }
  // repoInfo,     //0
  // commitNumber, //1
  // locCount,     //2
  // allPrsAndIssues,  //3
  // closedPrsAndIssues, //4
  // community,    //5
  // contributors,  //6
  // labels         //7
  // issues         //8
  // pulls          //9
}

const request = function(url, params) {
  try {
    console.log("-- Testing " + url + "\n |--- with params: " +
      JSON.stringify(params));
    //strip out the repeated bit of the URL
    let urlSnippet = url.split("GET /repos/{owner}/{repo}")[1];

    //some edge cases where we need alternate results. There's probably a tidier
    // way to do this.
    let response = responses[urlSnippet];
    if (params.page) {
      response = responses.page[urlSnippet][params.state];
    } else if (params.state) {
      response = responses.state[urlSnippet][params.state];
      //  console.log("Blergh?", responses.state[urlSnippet]);
    } else {
      //console.log("waaaaaaaaaaaaaaaa");
    }

    return response;
  } catch (error) {
    console.error("OY VEY", url, ", snip: ", "\n\n", error);
  }
}


exports.init = function() {
  console.log("Mock Octokit activated ====== 🐙");
  return {
    request: request
  };
}
