const headers = require("./fake_header"),
 fakeIssues = require("./generate_fake_pr_or_issue");

module.exports = {
  page: {
    "open": {
      data: fakeIssues(3, "issue", "open")
    }, //3
    "closed": {
      data: fakeIssues(7, "issue", "closed")
    }, //7
    "all": {
      data: fakeIssues(10, "issue", "all")
    } //10.
  },
  "open": {
    data: fakeIssues(100, "issue", "open"),
    headers: headers(3)
  },
  "closed": {
    data: fakeIssues(100, "issue", "closed"),
    headers: headers(55)
  },
  "all": {
    data: fakeIssues(100, "issue", "all"),
    headers: headers(88)
  },
  labels: {
    'hacktoberfest': {
      data: fakeIssues(2, "issue", "open")
    }, //2
    'good first bug': {
      data: fakeIssues(9, "issue", "open")
    }, //9
    'help wanted': {
      data: fakeIssues(11, "issue", "open")
    } //11.
  }
}
