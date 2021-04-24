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
function randAuthor() {
  return "author" + Math.floor(Math.random() * 5);
}

function makeSparseArray(howManyThings) {
  let sparseCommits = [];
  for (var i = 1; i <= howManyThings; i++) {
    sparseCommits.push({});
  }
  return sparseCommits;
}

//make a sparse array for commit counts - no need to have real commit ids or usernames

mock[1].data = makeSparseArray(100);

// anonymise authors from sample real data and remove un-needed fields
var authors = mock[6].data;
for (author in authors) {
  authors[author].author = {
    "login": randAuthor()
  };
}

// anonymise authors from sample real data and remove un-needed fields
var users = mock[8].data;
for (user in users) {
  users[user].user = {
    "login": randAuthor()
  };
}

var moreUsers = mock[9].data;
for (user in moreUsers) {
  moreUsers[user].user = {
    "login": randAuthor()
  };
}

//  we also need to make paginated data for some of these  results

function fakePaginatedHeader(numOfPages) {
  return {
    "link": "<https://api.github.com/repositories/207777561/commits?per_page=100&page=2>; rel=\"next\", <https://api.github.com/repositories/207777561/commits?per_page=100&page=" +
      numOfPages + ">; rel=\"last\""
  };
}

const paginatedData = {
  issues: {
    data: makeSparseArray(42),
    headers: fakePaginatedHeader(4)
  }, //total of 342 ressults
  commits: {
    data: makeSparseArray(58),
    headers: fakePaginatedHeader(9)
  }, // total  of  858 results
  pulls: {
    data: makeSparseArray(04),
    headers: fakePaginatedHeader(3)
  } // total of 204 results
}
mock.push(paginatedData) //this is mock[10]




fs.writeFile(saveFileName, JSON.stringify(mock), (err) => {
  if (err) {
    console.error(err);
    throw err;
  }
  console.log("Data saved to " + saveFileName);
});
