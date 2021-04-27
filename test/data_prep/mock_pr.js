const headers = require("./fake_header"),
 fakeIssues = require("./generate_fake_pr_or_issue");

module.exports = {
  page: {
    open: {
      data: fakeIssues(5, "pr", "open")
    },
    closed: {
      data: fakeIssues(23, "pr", "closed")
    },
    all: {
      data: fakeIssues(28, "pr", "all")
    }
  },
  open: {
    data: fakeIssues(100, "pr", "open"),
    headers: headers(2)
  },
  closed: {
    data: fakeIssues(100, "pr", "closed"),
    headers: headers(3)
  },
  all: {
    data: fakeIssues(100, "pr", "all"),
    headers: headers(3)
  }
}
