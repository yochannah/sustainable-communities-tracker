//I'm so proud of this file name. Let's fake Octokit responses for our tests.

const mockData  = require("./processedmockData.json");

//this response object  maps the serialised object (which is a modified real
// http response) to our mock octokit.
var responses = {
  "" : mockData[0],
  "/commits" : mockData[1],
  "/languages":mockData[2],
  //3 and 4 are aggregate results and are not drawn on as mock test data
  "/community/profile" : mockData[5],
  "/stats/contributors" : mockData[6],
  "/labels" :  mockData[7],
  "/issues" :  mockData[8],
  "/pulls" :  mockData[9]
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
  console.log("-- Testing " + url + "\n |--- with params: "
    + JSON.stringify(params));
  //strip out the repeated bit of the URL
  let urlSnippet = url.split("GET /repos/{owner}/{repo}")[1];
  return responses[urlSnippet];
}


exports.init = function(){
    console.log("Mock Octokit activated ====== 🐙");
    return {request : request};
  }
