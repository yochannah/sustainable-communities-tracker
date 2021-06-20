//to generate:
//Project ID		Name	Month 0 - survey	Month 0 - auto	month 0 - manual	Repo notice	CoC enforcement	Mentorship	Month 6 - auto	month 6 - manual	Month 12 - auto	gh repos used

const csvLib = require('objects-to-csv'),
  inFilePath = process.env.github_sustain_filepath + "month0/auto/",
  fs = require('fs'),
  fsPromises = require('fs').promises;

var errorRepos = [], results = [], promises = [];

async function readAllFiles() {
  try {
    //we look at all our repo reports
    const files = await fsPromises.readdir(inFilePath);
    for (const file in files) {
      let f = files[file];
      // we don't want to read anything except json files
      // bad files are such as ds_store
      if (f.endsWith('.json')) {
        let p = fsPromises.readFile(inFilePath + f, "utf8")
        .then(function(data) {
          let ourJson = JSON.parse(data);
          // I'm splitting strongs to get the repo url.
          // this is so hacky... I wish I'd saved the URLs in the first place
          try {
            repoUrl = ourJson.community.files.readme.html_url.split("/blob")[0];
            results.push(repoUrl);
          } catch (err) {
            errorRepos.push(f);
          }
        }).catch(function() {
          console.log("Error", errorRepos);
        });
        //save this so  we know when all the files are read.
        promises.push(p);
      }
    }

    Promise.all(promises).then(function(x,y){
      if(errorRepos.length) {
        console.error("===========", errorRepos);
      }
      console.log(results);
    })


  } catch (err) {
    console.error(err);
  };
};

readAllFiles();
