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


//randFunction taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// thanks, Mozilla Contributors!
function randAuthor(){
  return "author" + Math.floor(Math.random() * 5);
}

//make a sparse array for commit counts - no need to have real commit ids or usernames
mock[1].data = new Array(100);

// anonymise authors from sample real data and remove un-needed fields
var authors = mock[6].data;
for (author in authors) {
  authors[author].author = {"login" : randAuthor()};
}

// anonymise authors from sample real data and remove un-needed fields
var users = mock[8].data;
for (user in users) {
  users[user].user = {"login" : randAuthor()};
}

var moreUsers = mock[9].data;
for (user in moreUsers) {
  moreUsers[user].user = {"login" : randAuthor()};
}

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

//delete keys we don't use


fs.writeFile(saveFileName, JSON.stringify(mock), (err) => {
    if (err) {
      console.error(err);
        throw err;
    }
    console.log("Data saved to " + saveFileName );
});
