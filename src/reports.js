const ObjectsToCsv = require('objects-to-csv'),
  inFilePath = process.env.github_sustain_filepath + "month0/",
  fs = require('fs'),
  fsPromises = require('fs').promises;

var errorRepos = [],
  warnings = [],
  results = [],
  promises = [];

async function readAllFiles() {
  try {
    //we look at all our repo reports
    const files = await fsPromises.readdir(inFilePath + "auto/");
    for (const file in files) {
      let f = files[file];
      // we don't want to read anything except json files
      // bad files are such as ds_store
      if (f.endsWith('.json')) {
        let p = fsPromises.readFile(inFilePath + "auto/" + f, "utf8")
          .then(function(data) {
            let ourJson = JSON.parse(data);
            // I'm splitting strongs to get the repo url.
            // this is so hacky... I wish I'd saved the URLs in the first place
            try {
              repoUrl = ourJson.community.files.readme.html_url.split("/blob")[0];
              results.push({
                url: repoUrl,
                dateSnapshotTaken: ourJson.dateSnapshotTaken
              });

              //usually this is a pretty good indicator that the original repo
              //report did NOT go well
              if (!ourJson.community.health_percentage) {
                warnings.push([repoUrl]);
              }

            } catch (err) {
              errorRepos.push([f]);
            }
          }).catch(function() {
            console.log("Error", errorRepos);
          });
        //save this so  we know when all the files are read.
        promises.push(p);
      }
    }

    //once it's all done we need to save our work!
    Promise.all(promises).then(function(x, y) {
      if (errorRepos.length) {
        console.log("😬 ---> there were " +
          errorRepos.length +
          " errors. Saved to report-errors.csv");
        let errorCsv = new ObjectsToCsv(errorRepos);
        errorCsv.toDisk(inFilePath + '/report-errors.csv');
      }
      if (results.length) {
        let goodCsv = new ObjectsToCsv(results);
        goodCsv.toDisk(inFilePath + '/report.csv');
        console.log("🙌 noice: " + results.length + " results saved to disk");
      } else {
        console.log("😨 ---> No results found.");
      }
      if (warnings.length) {
        let warnCsv = new ObjectsToCsv(results);
        warnCsv.toDisk(inFilePath + '/report.csv');
        console.log("😅 ---> Well, : " + warnings.length +
          " warnings saved to disk");
      } else {
        console.log("😌 ---> No warnings found.");
      }
    })


  } catch (err) {
    console.error(err);
  };
};

readAllFiles();
