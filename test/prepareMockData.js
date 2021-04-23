//this transform uses the interimResponse data from app.js
// there is currently no pipeline to serialise to mockData.json.

//https://melvingeorge.me/blog/get-all-the-contents-from-file-as-string-nodejs
// Thanks, MelvinGeorge for helping me remember how to read files
const fs = require("fs"),
fileName = "mockData.json";
var buffer = fs.readFileSync(fileName);
mock = JSON.parse(buffer.toString())

//randFunction taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// thanks, Mozilla Contributors!
function randAuthor(){
  return "author" + Math.floor(Math.random() * 5);
}

//make a sparse array for commit counts - no need to have real commit ids or usernames
sparseCommits = [];
for (var i=1; i <=100; i++) {
  sparseCommits.push({});
}
mock[1].data = sparseCommits;

// anonymise authors from sample real data and remove un-needed fields
authors = mock[6].data;
for (author in authors) {
  authors[author].author = {"login" : randAuthor()};
}

// delete most of the http headers as we don't use them. 
for (m in mock) {
  delete mock[m].headers;
}

fs.appendFile("processed" + fileName, JSON.stringify(mock), (err) => {
    if (err) {
      console.error(err);
        throw err;
    }
    console.log("File is updated.");
});
