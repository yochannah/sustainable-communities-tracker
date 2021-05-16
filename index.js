const ghGetter = require("./src/app.js"),
  fs = require('fs'),
  args = process.argv.slice(2), // the first two arguments are built in to nodejs
  filePath = process.env.github_sustain_filepath;

var repo = args[0],
  org = args[1],
  month = args[2];

if (!filePath) {
  console.error("🤕 Oops, there's no filepath specified. Please set 'process.env.github_sustain_filepath' or reload your terminal")
}

if (repo && org && month && filePath) {
  console.log(repo, org);
  console.log("=== 🌺 Running sustainability report for: ");
  console.log("   |====================================|");
  console.log("   | REPO: ", repo);
  console.log("   |  ORG: ", org);
  console.log("   | -------------------- ");
  console.log("   | saving to: ", filePath);
  console.log("   |====================================|");

  try {
    const fileName = filePath + "/" + month + "/auto/"
     + org + "_" + repo + ".json";
    ghGetter.fullRun(repo, org).then(function(result) {
      fs.writeFile(fileName + "", JSON.stringify(result), function(err) {
        if (err) return console.log(err);
        console.log('saved data to ' + fileName);
      });
    });
  } catch (e) {
    console.error("=== 😔 Uhoh, it didn't work: ", e, "===")
  }
} else {
  console.log("Missing repo, org, or month details");
}
