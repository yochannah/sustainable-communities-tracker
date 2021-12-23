module.exports = {
  runningReport: function(repo, org, filePath) {
    return `
  === 🌺 Running sustainability report for:
  | REPO: ${repo}
  |  ORG: ${org}
  | saving to: ${filePath}
  | -------------------- `
  }
};
