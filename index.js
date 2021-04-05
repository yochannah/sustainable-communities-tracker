const { Octokit } = require("@octokit/core");
const parse = require('parse-link-header');

const octokit = new Octokit({
  auth: process.env.github_sustain_sw_token,
});

const repo = 'open-life-science.github.io',
owner = 'open-life-science';

var resultStore = {};


// with thanks to orelsanpls for helping me remember how to do async es6 functions
// cc-by-sa https://stackoverflow.com/questions/49432579/await-is-only-valid-in-async-function
const checkCoC = async function(resultStore) {
  const result = await octokit.request('GET /repos/{owner}/{repo}/community/code_of_conduct', {
      "owner": owner,
      "repo": repo,
      "mediaType": {'previews': ['scarlet-witch']}})
   resultStore.code_of_conduct = result.data;
}

// checkCoC(resultStore).then(function(){
//   console.log("=*=*=*=*=*=*=*==================",resultStore);
// });

// Method taken from https://stackoverflow.com/questions/27931139/how-to-use-github-v3-api-to-get-commit-count-for-a-repo
// which is licensed CC-BY-SA - thanks Snowe!
//
// RECIPE:
//   # * take the pagination number
//   # * get the last page
//   # * see how many items are on it
//   # * multiply the number of pages - 1 by the page size
//   # * and add the two together. Boom. Commit count in 2 api calls
checkNoOfCommits = async function(resultStore) {
  var maxPerPage = 100;
  try {
    const result = await octokit.request('GET /repos/{owner}/{repo}/commits', {
      "owner": owner,
      "repo": repo,
      "per_page" : maxPerPage
    });

    const numOnFirstPage =  result.data.length,
    links = parse(result.headers.link);
    var lastPage = 1, //We'll always have at least one page of results
    lastPageCount = 0; // this is only used if we get higher than one page

    console.log(">>>>>>>>",links)

    //if there's more than one page, we'll need to count how many
    // results are on the last page as it may be less than the maxPerPage
    if (numOnFirstPage === maxPerPage) {
      lastPage = links.last.page;
      var lastPageResult = await octokit.request('GET /repos/{owner}/{repo}/commits', {
        "owner": owner,
        "repo": repo,
        "per_page" : maxPerPage,
        "page" : 9
      });
      lastPageCount = lastPageResult.data.length
      console.log("%%%%%Last page count",lastPageCount);
    }

    const fullPages = (lastPage - 1) * maxPerPage;


    resultStore.noOfCommits = fullPages + lastPageCount;
  } catch (e) {
    console.error(e)
  }
}

checkNoOfCommits(resultStore).then(function(){
  console.log("=*=*=*=*=*=*=*==================",resultStore);
});
