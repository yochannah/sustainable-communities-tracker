const { Octokit } = require("@octokit/core");
const parse = require('parse-link-header');



var repo = 'open-life-science.github.io',
    owner = 'open-life-science',
    octokit;

const maxPerPage = 100;

const init = function() {
  const MyOctokit = Octokit.defaults({
    "auth": process.env.github_sustain_sw_token,
    "mediaType": {'previews': ['scarlet-witch']}
  });
  octokit = new MyOctokit();
}();


// with thanks to orelsanpls for helping me remember how to do async es6 functions
// cc-by-sa https://stackoverflow.com/questions/49432579/await-is-only-valid-in-async-function
const checkCoC = async function() {
  return result = await octokit.request('GET /repos/{owner}/{repo}/community/code_of_conduct', {
      "owner": owner,
      "repo": repo,
      "mediaType": {'previews': ['scarlet-witch']}});
}

// Method taken from https://stackoverflow.com/questions/27931139/how-to-use-github-v3-api-to-get-commit-count-for-a-repo
// which is licensed CC-BY-SA - thanks Snowe!
//
// RECIPE:
//   # * take the pagination number
//   # * get the last page
//   # * see how many items are on it
//   # * multiply the number of pages - 1 by the page size
//   # * and add the two together. Boom. Commit count in 2 api calls
const checkNoOfResults = async function(endpoint, state) {
  try {
    const url = 'GET /repos/{owner}/{repo}/' + endpoint,

    result = await octokit.request(url, {
      "owner": owner,
      "repo": repo,
      "per_page" : maxPerPage,
      "state" : state
    });

    return result;
  } catch (e) {
    console.error(e);
    return e;
  }
}

const countPaginatedResults = async function (result, endpoint, state) {
    const numOnFirstPage =  result.data.length,
    links = parse(result.headers.link);
    var lastPage = 1,  // We'll always have at least one page of results
    lastPageCount = 0; // this is only used if we get higher than one page

    //if there's more than one page, we'll need to count how many
    // results are on the last page as it may be less than the maxPerPage
    if (numOnFirstPage === maxPerPage) {
      lastPage = links.last.page;
      var lastPageResult = await octokit.request('GET /repos/{owner}/{repo}/' + endpoint, {
        "owner": owner,
        "repo": repo,
        "per_page" : maxPerPage,
        "page" : lastPage,
        "state" : state
      });
      lastPageCount = lastPageResult.data.length
    }

    const fullPages = (lastPage - 1) * maxPerPage;
    return noOfResults = fullPages + lastPageCount;
}

// We're using bytes per language as a proxy for the amount of content
// or  "lines of code".
// use with caution, this is not comparable from project to project,
// but can be used as an internal measure of change or stability.
const checkLocCount = async function(){
  return langs = await octokit.request('GET /repos/{owner}/{repo}/languages', {
    "owner": owner,
    "repo": repo
  });
}

const processLocCount = async function() {
  //adds the totals of bytes per language for one easy to parse metric
  function summariseLangs(langs) {
    var oneCountToRuleThemAll = 0;
    Object.keys(langs.data).map(function(lang){
      oneCountToRuleThemAll = oneCountToRuleThemAll + langs.data[lang];
    });
    return oneCountToRuleThemAll;
  }

  return bytesOfContent = {
    breakdown : langs.data,
    totalBytes : summariseLangs(langs)
  }
}

const checkRepoInfo = async function() {
  return repoInfo = await octokit.request('GET /repos/{owner}/{repo}', {
    "owner": owner,
    "repo": repo,
    "mediaType": {'previews': ['scarlet-witch']}
  })
};

const processRepoInfo = function(repoInfo) {
  const data = repoInfo.data;
  return  {
    code_of_conduct : data.code_of_conduct,
    license : data.license,
    created_at : data.created_at,
    updated_at : data.updated_at,
    stargazers_count: data.stargazers_count,
    watchers_count: data.watchers_count,
    forks_count: data.forks_count,
    archived: data.archived,
    disabled: data.disabled,
    issues : {
      currently_open : data.open_issues_count
    }
  }
}

const processIssuesAndPRAggregates = async function(state) {

  //first page results for each of the counts
  let intIssueCount = checkNoOfResults("issues", state),
  intprCount = checkNoOfResults("pulls", state),
  interimResponse = await Promise.all([intIssueCount, intprCount]);

  //this request set depends on the previous two
  let issueCount = countPaginatedResults(interimResponse[0], "issues", state),
  prCount = countPaginatedResults(interimResponse[1], "pulls", state),
  results = await Promise.all([prCount, issueCount]);
  // github returns pulls and issuess when you ask for issues so we have to calculate
  // real issues by subtracting the prs!
  return {
    prs : results[0],
    issues : results[1] - results[0]
  };
}

async function fullRun() {
  try {
    let repoInfo = checkRepoInfo(),
    commitNumber = checkNoOfResults("commits"),
    locCount = checkLocCount(),
    allPrsAndIssues = processIssuesAndPRAggregates("all"),
    closedPrsAndIssues =  processIssuesAndPRAggregates("closed"),
    interimResponse = await Promise.all([
      repoInfo,     //0
      commitNumber, //1
      locCount,     //2
      allPrsAndIssues,  //3
      closedPrsAndIssues //4
    ]),
    resultStore = {
      repoInfo : processRepoInfo(interimResponse[0]),
      commitCount : await countPaginatedResults(interimResponse[1], "commits"),
      locCount : await processLocCount(interimResponse[2]),
      prs : {
        all: interimResponse[3].prs,
        closed: interimResponse[4].prs,
        open: interimResponse[3].prs - interimResponse[4].prs
      },
      issues : {
        all: interimResponse[3].issues,
        closed: interimResponse[4].issues,
        open: interimResponse[3].issues - interimResponse[4].issues
      },
      dateSnapshotTaken : new Date().toISOString()
    };
    return resultStore;
  } catch (e) {
    console.error(e);
    return e;
  }
}

fullRun().then(function(result){
  console.log(result)
});

// checkIssues().then(function(x){
//     checkPulls().then(function(y){
//           console.log("\n --> done");
//     });
// });
