//I'm so proud of this file name. Let's fake Octokit responses for our tests.

var responses = {
  "" : {data: [1,2,3]}
}

const request = function(url, params) {
  console.log("-- Testing " + url + "\n |--- with params: " + params);
  //strip out the repeated bit of the URL
  let urlSnippet = url.split("GET /repos/{owner}/{repo}")[1];
  console.log(urlSnippet);
  return responses[urlSnippet];
}


exports.init = function(){
    console.log("well, this is my fake 🐙");
    return {request : request};
  }
