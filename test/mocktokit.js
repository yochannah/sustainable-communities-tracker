//I'm so proud of this file name. Let's fake Octokit responses for our tests.

const mockData = require("./processedmockData.json"),
  mock_issue = require("./mock_issue.js"),
  mock_pull = require("./mock_pr.js"),
  mock_commit = require("./mock_commit.js"),
  mock_labels = require("./mock_labels.js");

//this response object  maps the serialised object (which is a modified real
// http response) to our mock octokit.


var responses = {
  "": mockData[0],
  "/commits": mock_commit,
  "/languages": mockData[2],
  //3 and 4 are aggregate results and are not drawn on as mock test data
  "/community/profile": mockData[5],
  "/stats/contributors": mockData[6],
  "/labels": mock_labels,
  "/issues": mock_issue,
  "/pulls": mock_pull,
  "page": {
    "/pulls": mock_pull.page,
    "/issues": mock_issue.page,
    "/commits":  {
      data : mock_commit.data,
      open: mock_commit.data,
      closed: mock_commit.data,
      all: mock_commit.data
    }
  },
  "state": {
    "/issues": mock_issue,
    "/pulls": mock_pull,
    "/commit": mock_commit
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
      //commits are neither open nor closed
      if (urlSnippet === "/commits") {
        console.log("JFC");
        response = responses.page[urlSnippet];
      }
    } else if (params.state) {
  //    console.log("🎖", params.state, "🎖🎖🎖");
  //    console.log("🎖", params.state, ", ", responses.state[urlSnippet]);
      response = responses[urlSnippet][params.state];

      //  console.log("Blergh?", responses.state[urlSnippet]);
    } else {
      //console.log("waaaaaaaaaaaaaaaa");
      console.log(response);
    }

    if(urlSnippet == "/commits") {
      console.log("⬇️⬇️⬇️⬇️");
      console.log(url, params, params.state);
      console.log("snip", responses.page[urlSnippet]);
console.log("snipstate", responses.page[urlSnippet][params.state]);
      console.log("⬆️⬆️⬆️⬆️");

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
