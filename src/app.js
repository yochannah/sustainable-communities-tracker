const {
  Octokit
} = require("@octokit/core");
const parse_headers = require('parse-link-header');
const fs = require('fs');

var octokit, repo, owner;

//// These settings can be edited if you wish, especially generateTestData
//// which is useful when you want to generate files to run tests on anew
//// e.g. perhaps if the github api changes.

const maxPerPage = 100,
  generateTestData = false,
  testDataFileName = "test/data_prep/mockData.json",
  ghDefaultLabels = ["bug", "documentation", "duplicate", "enhancement", "good first issue", "help wanted", "invalid", "question", "wontfix"],
  mentorshipLabels = ["good first issue", "first-timers-only", "hacktoberfest", "outreachy", "gsoc", "help wanted", "help needed"];

////// Don't edit from here on, thanks!

const init = function() {
  const MyOctokit = Octokit.defaults({
    "auth": process.env.github_sustain_sw_token,
    "mediaType": {
      'previews': ['scarlet-witch']
    }
  });
  return octokit = new MyOctokit();
};


// with thanks to orelsanpls for helping me remember how to do async es6 functions
// cc-by-sa https://stackoverflow.com/questions/49432579/await-is-only-valid-in-async-function
const checkCoC = async function() {
  return result = await octokit.request('GET /repos/{owner}/{repo}/community/code_of_conduct', {
    "owner": owner,
    "repo": repo,
    "mediaType": {
      'previews': ['scarlet-witch']
    }
  });
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

const checkNoOfResults = async function(endpoint, state, label) {

  try {
    const url = 'GET /repos/{owner}/{repo}/' + endpoint,
      params = {
        "owner": owner,
        "repo": repo,
        "per_page": maxPerPage,
        "state": state,
        "labels": label
      },
      result = await octokit.request(url, params);

    if (!result) {
      console.error("🤖🤖🤖🤖🤖🤖");
      console.error("I'm sorry dave, I'm afraid I can't do that");
      console.error("no result for Url: \n", url, "|--\nparams: ", params);
    }

    if (generateTestData) {
      //this serialises a real-world response which we can process to create
      //test data. Usually we won't need this as test data shouldn't  change
      // unless  we add more methods or the API changes and we need to match
      // the changed github api
      if (endpoint == "issues") {
        testIssues = result;
      }
      if (endpoint == "pulls") {
        testPulls = result;
      }
    }


    return result;
  } catch (e) {
    console.error(e);
    return e;
  }
}

const countPaginatedResults = async function(result, endpoint, state, label) {

  try {
    if (!result) {
      console.error("~~~~~~~~~~~~~there's no result! ", result)
    }
    const numOnFirstPage = result.data.length,
      links = parse_headers(result.headers.link);
    var lastPage = 1, // We'll always have at least one page of results
      lastPageCount = numOnFirstPage;

    //if there's more than one page, we'll need to count how many
    // results are on the last page as it may be less than the maxPerPage
    if (numOnFirstPage === maxPerPage) {
      lastPage = links.last.page;
      var lastPageResult = await octokit.request('GET /repos/{owner}/{repo}/' + endpoint, {
        "owner": owner,
        "repo": repo,
        "per_page": maxPerPage,
        "page": lastPage,
        "state": state,
        "labels": label
      });
      lastPageCount = lastPageResult.data.length
    }

    const fullPages = (lastPage - 1) * maxPerPage;
    return noOfResults = fullPages + lastPageCount;
  } catch (e) {
    console.error("Gvald! {", endpoint, "}", state, label, "\n", e);
    console.log(result);
  }
}

// We're using bytes per language as a proxy for the amount of content
// or  "lines of code".
// use with caution, this is not comparable from project to project,
// but can be used as an internal measure of change or stability.
const checkLocCount = async function() {
  return langs = await octokit.request('GET /repos/{owner}/{repo}/languages', {
    "owner": owner,
    "repo": repo
  });
}

const processLocCount = async function() {
  //adds the totals of bytes per language for one easy to parse metric
  function summariseLangs(langs) {
    var oneCountToRuleThemAll = 0;
    Object.keys(langs.data).map(function(lang) {
      oneCountToRuleThemAll = oneCountToRuleThemAll + langs.data[lang];
    });
    return oneCountToRuleThemAll;
  }

  return bytesOfContent = {
    breakdown: langs.data,
    totalBytes: summariseLangs(langs)
  }
}

const checkRepoInfo = async function() {
  return repoInfo = await octokit.request('GET /repos/{owner}/{repo}', {
    "owner": owner,
    "repo": repo,
    "mediaType": {
      'previews': ['scarlet-witch']
    }
  })
};

const processRepoInfo = function(repoInfo) {
  const data = repoInfo.data;
  return {
    code_of_conduct: data.code_of_conduct,
    license: data.license,
    created_at: data.created_at,
    updated_at: data.updated_at,
    stargazers_count: data.stargazers_count,
    watchers_count: data.watchers_count,
    forks_count: data.forks_count,
    archived: data.archived,
    disabled: data.disabled,
    issues: {
      currently_open: data.open_issues_count
    }
  }
}

const processIssuesAndPRAggregates = async function(state, label) {
  //first page results for each of the counts
  let intIssueCount = checkNoOfResults("issues", state, label),
    intprCount = checkNoOfResults("pulls", state),
    interimResponse = await Promise.all([intIssueCount, intprCount]);

  //this request set depends on the previous two
  let issueCount = countPaginatedResults(interimResponse[0], "issues", state, label),
    prCount = countPaginatedResults(interimResponse[1], "pulls", state),
    results = await Promise.all([prCount, issueCount]);
  // github returns pulls and issuess when you ask for issues so we have to calculate
  // real issues by subtracting the prs!

  //the PR endpoint doesn't filter by label.
  var returnObj;
  if (label) {
    returnObj = results[1];
  } else {
    returnObj = {
      prs: results[0],
      issues: results[1] - results[0]
    };
  }
  return returnObj;
}

const getCommunityStats = async function() {
  const community = await octokit.request('GET /repos/{owner}/{repo}/community/profile', {
    "owner": owner,
    "repo": repo
  });
  return community.data;
}

const getContributors = async function() {
  const conts = await octokit.request('GET /repos/{owner}/{repo}/stats/contributors', {
    "owner": owner,
    "repo": repo
  });
  return conts;
}

const processContributors = function(response) {
  try {
    return response.data.map(function(contributor) {
      return {
        commits: contributor.total,
        github_id: contributor.author.login
      }
    });
  } catch (e) {
    if (response.status === 202) {
      console.log("Status 202 - request accepted (but not completed). Please try re-running in a few seconds");
    } else {
      console.error("Problem processing data. Data was: ", response.data, response);
      console.error("---> error: ", e);
    }
  }
}


const checkLabels = async function() {
  return await octokit.request('GET /repos/{owner}/{repo}/labels', {
    "owner": owner,
    "repo": repo
  });
}

const processLabels = async function(response) {
  const labelList = response.data.map(function(label) {
    return label.name;
  });

  //from label list, we want to count only open mentorship labels
  const mentorshipLabelList = labelList.filter(label =>
      mentorshipLabels.indexOf(label) >= 0),
    labelsToCheck = [],
    labelsToStore = labelList.filter(label =>
      ghDefaultLabels.indexOf(label) >= 0);

  mentorshipLabelList.forEach(function(label) {
    labelsToCheck.push(processIssuesAndPRAggregates("open", label));
  });

  response = await Promise.all(labelsToCheck);

  theGoodStuff = {}

  response.map(function(count, i) {
    theGoodStuff[mentorshipLabelList[i]] = count;
  });

  return {
    open_mentorship_labels: theGoodStuff,
    all_labels: labelsToStore
  };
}

//function authored by Nofi, CC-BY-SA 4.0
// Thanks Nofi https://stackoverflow.com/a/32180863
function msToTime(ms) {
  let seconds = (ms / 1000).toFixed(1);
  let minutes = (ms / (1000 * 60)).toFixed(1);
  let hours = (ms / (1000 * 60 * 60)).toFixed(1);
  let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
  if (seconds < 60) return seconds + " Sec";
  else if (minutes < 60) return minutes + " Min";
  else if (hours < 24) return hours + " Hrs";
  else return days + " Days"
}


async function timeToMergePrOrIssue() {
  //we use "prs" here but it equally could be issues
  //theyre nearly identical.
  var params = {
      "owner": owner,
      "repo": repo,
      "per_page": maxPerPage,
      "state": "all"
    },
    url = 'GET /repos/{owner}/{repo}/issues',
    prs = await octokit.request(url, params),
    lastPage;

  //we probably have  more pages
  if (prs.data.length === maxPerPage) {
    let links = parse_headers(prs.headers.link);
    lastPage = links.last.page;
  }

  var allPageRequests = [],
    allPrs = prs.data;

  if (lastPage) {
    for (var i = 2; i <= lastPage; i++) {
      params.page = i;
      let subsequent = await octokit.request(url, params);
      allPageRequests.push(subsequent);
    }
    let prInfo = await Promise.all(allPageRequests);

    //now we only want one array of pr data
    prInfo.map(function(thePage) {
      allPrs = allPrs.concat(thePage.data);
    });
  }


  function isPr(prOrIssue) {
    if (prOrIssue.pull_request) {
      return "pr";
    } else {
      return "issue";
    }
  }

  let resolutionInfo = {
    pr: [],
    issue: [],
    timeToClose: {
      pr: [],
      issue: []
    }
  }
  allPrs.map(function(pr) {
    let isPrOrIssue = isPr(pr);
    let response = {
      id: pr.id,
      created_at: pr.created_at,
      closed: false,
      pr_or_issue: isPrOrIssue
    };
    //may not be closed or merged...
    if (pr.closed_at) {
      response.closed_at = pr.closed_at;
      response.closed = true;
    }
    if (pr.merged_at) {
      response.merged_at = pr.merged_at;
      response.closed = true;
    }

    //calculate closed/merged time if known
    let createdTime = new Date(response.created_at);

    if (response.closed) {
      let closedTime = new Date(response.merged_at || response.closed_at);
      response.timeToClose = closedTime - createdTime;
      response.humanReadableTimeToClose = msToTime(response.timeToClose);
      //store it up so we can calculate the median
      resolutionInfo.timeToClose[isPrOrIssue].push(response.timeToClose);
    }
    resolutionInfo[isPrOrIssue].push(response);
  });

  //console.log(resolutionInfo);

  prMedian = calculateMedian(resolutionInfo.timeToClose.pr);
  issueMedian = calculateMedian(resolutionInfo.timeToClose.issue);

  prMean = calculateMean(resolutionInfo.timeToClose.pr);
  issueMean = calculateMean(resolutionInfo.timeToClose.issue);

  resolutionInfo.timeToClose.pr = {
    median: {
      ms: prMedian,
      humanReadable: msToTime(prMedian)
    },
    mean: {
      ms: prMean,
      humanReadable: msToTime(prMean)
    }
  };
  resolutionInfo.timeToClose.issue = {
    median: {
      ms: issueMedian,
      humanReadable: msToTime(issueMedian)
    },
    mean: {
      ms: issueMean,
      humanReadable: msToTime(issueMean)
    }

  };
  return resolutionInfo;
}

function calculateMedian(anArray) {
  //needs to be sorted if we want to get the middlest  (median) value
  if (anArray.length) {
    anArray.sort();

    let len = anArray.length,
      middlePosition = len / 2,
      middlestValue;
    if ((len % 2) === 0) {
      //it's even
      let higherMiddleValue = anArray[middlePosition],
        lowerMiddleValue = anArray[middlePosition - 1];

      middlestValue = (higherMiddleValue + lowerMiddleValue) / 2;

      // it's odd
    } else {
      //always round down the position, since arrays are 0 indexed.
      middlestValue = anArray[Math.floor(len / 2)];
    }

    return middlestValue;
  } else {
    return null;
  }

}

function calculateMean(anArray) {
  //this is the mean aka average of an array
  //seriously I don't need hundred precision decimalss of ms though
  // so we round it.
  if (anArray.length) {
    let sum = anArray.reduce(function(a, b) {
      return a + b;
    });
    return Math.round(sum / anArray.length);
  } else {
    return null;
  }
}

async function fullRun(repository, org, anOctokit) {
  repo = repository;
  owner = org;
  octokit = anOctokit || init();

  try {
    let repoInfo = checkRepoInfo(),
      commitNumber = checkNoOfResults("commits"),
      locCount = checkLocCount(),
      allPrsAndIssues = processIssuesAndPRAggregates("all"),
      closedPrsAndIssues = processIssuesAndPRAggregates("closed"),
      community = getCommunityStats(),
      contributors = getContributors(),
      labels = checkLabels(),
      timeToMerge = timeToMergePrOrIssue(),
      interimResponse = await Promise.all([
        repoInfo, //0
        commitNumber, //1
        locCount, //2
        allPrsAndIssues, //3
        closedPrsAndIssues, //4
        community, //5
        contributors, //6
        labels, //7
        timeToMerge //
      ]),
      resultStore = {
        repoInfo: processRepoInfo(interimResponse[0]),
        commitCount: await countPaginatedResults(interimResponse[1], "commits"),
        locCount: await processLocCount(interimResponse[2]),
        prs: {
          all: interimResponse[3].prs,
          closed: interimResponse[4].prs,
          open: interimResponse[3].prs - interimResponse[4].prs
        },
        issues: {
          all: interimResponse[3].issues,
          closed: interimResponse[4].issues,
          open: interimResponse[3].issues - interimResponse[4].issues
        },
        community: interimResponse[5],
        contributors: processContributors(interimResponse[6]),
        labels: await processLabels(interimResponse[7]),
        dateSnapshotTaken: new Date().toISOString(),
        timeToMerge: await timeToMerge
      };

    if (generateTestData) {
      var testData = interimResponse;
      testData.push(testIssues);
      testData.push(testPulls);
      testData = JSON.stringify(testData);

      fs.writeFile(testDataFileName, testData, function(err) {
        if (err) return console.log(err);
        console.log('saved test data to ' + testDataFileName);
      });
    }


    return resultStore;
  } catch (e) {
    console.error(e);
    return e;
  }
}

module.exports = {
  fullRun: fullRun,
  calculateMedian: calculateMedian,
  calculateMean: calculateMean
};
