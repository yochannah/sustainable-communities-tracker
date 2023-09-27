module.exports = {
  runningReport: function(repo, org, filePath) {
    return `
  === 🌺 Running sustainability report for:
  | REPO: ${repo}
  |  ORG: ${org}
  | saving to: ${filePath}
  | -------------------- `
  },
  reasons : {
    hasActivity: "Returns true if there was activity in this repo in the last month."
  }
};
