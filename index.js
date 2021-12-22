const ghGetter = require("./src/app.js"),
  fs = require('fs'),
  yargs = require('yargs'),
  args = process.argv.slice(2), // the first two arguments are built in to nodejs
  filePath = process.env.github_sustain_filepath;

  const singleRepo = function(url, month) {
    try {
      let urlBits = url.split("https://github.com/")[1].split("/");
      org = urlBits[0];
      repo = urlBits[1];
    } catch (e) {
      console.error("Oy vey, we can't parse this url. Error text: ", e);
    }

    if (!filePath) {
      console.error("🤕 Oops, there's no filepath specified. Please set 'process.env.github_sustain_filepath' or reload your terminal")
    }

    if (repo && org && filePath) {
      console.log("\n");
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
      console.log("Missing repo or org for ", url);
    }
  };


const argv = yargs
    .command('$0', 'Gather github stats for a repo', {
      month: {
        description: 'Month this stat set is being gathered. Usually 0, 6, or 12.',
        type: 'number',
        aliases : ["gather","gatherInfo"],
        required : true
      }
    })
    .options({
      urlList: {
          description: 'Filepath to a list of URLs to check. One per row.',
          alias: 'urls',
          type: 'string'
      },
      url : {
        description: 'Single URL to check - format: https://github.com/org/repo',
        alias: 'repo',
        type: 'string'
      }
    })
    .help()
    .alias('help', 'h')
    .argv;

const month = "month" + argv.month;

if (!argv.urlList && !argv.url) {
  console.error("required: either url or urllist");
}
if (argv.urlList && argv.url) {
  console.error("url or urllist are mutually exclusive: choose one or the other, not both.");
}
else if (argv.url) {
  singleRepo(argv.url, month);
} else if (argv.urlList) {
  fs.readFile(argv.urlList, "utf8", function(err, data){
    if(err) {
      console.error(err);
    } else {
      urls = data.split("\n");
      urls.map(function(repo) {
        console.log(">>" + repo + "<<");
        singleRepo(repo, month);
      });
    }
  });
}
