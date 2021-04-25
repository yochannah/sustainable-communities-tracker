//this transform uses the interimResponse data from app.js
// there is currently no pipeline to serialise to mockData.json.
// you\ll just have to print it to console or similar.

//https://melvingeorge.me/blog/get-all-the-contents-from-file-as-string-nodejs
// Thanks, MelvinGeorge for helping me remember how to read files
const fs = require("fs"),
fileName = "mockData.json",
saveFileName = ("../processed" + fileName),
buffer = fs.readFileSync(fileName),
mock = JSON.parse(buffer.toString());


// delete most of the http headers as we don't use them.
for (m in mock) {
  if (mock[m].headers) {
    let headers = {};
    //link is used for pagination methods
    headers.link = mock[m].headers.link;
    delete mock[m].headers;
    mock[m].headers = headers;
  } else {
    delete mock[m].headers;
  }
}

//randFunction taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// thanks, Mozilla Contributors!
function randAuthor(){
  return "author" + Math.floor(Math.random() * 5);
}

// anonymise authors from sample real data and remove un-needed fields
var authors = mock[6].data;
for (author in authors) {
  authors[author].author = {"login" : randAuthor()};
}


//we don't need most of they keys in the data
myMock = {
  repoInfo : mock[0],
  languages : mock[2],
  community: mock[5],
  contributors: mock[6]
}

console.log(mock);

fs.writeFile(saveFileName, JSON.stringify(myMock), (err) => {
    if (err) {
      console.error(err);
        throw err;
    }
    console.log("Data saved to " + saveFileName );
});
