const fs = require('fs');
const path = require('path');

const initFilePath = function (month, filePath) {
  const thePath = getFilePath(filePath, month);
  console.log("⏩ output files will save to", thePath);
  fs.mkdirSync(thePath, {
    recursive: true
  }, function (error) {
    if (error) {
      throw "😬 error initialising filepath" + error;
    }
  });
  return thePath;
}

const getFilePath = function (filePath, month) {
  if (month) {
    return thePath = path.join(filePath, month, "auto");
  } else {
    return thePath = path.join(filePath);
  }
}

const saveFile = function (contents, fileName) {
  fs.writeFileSync(fileName, contents, function (err) {
    if (err) {
      console.log(err);
      return false;
    }
    console.log('💾 saved data to' + fileName);
    return true;
  });
}

/**
 * Returns a 2d array split out from a tsv file. 
 * @param {string} somePath - path to the tsv file.
 * */
const readTsv = function (somePath) {
  return new Promise(function (resolve, reject) {
    fs.readFile(somePath, "utf8", function (err, data) {
      if (err) {
        console.error("🙄", err);
      } else {
        var lines = data.split("\n");
        lines = lines.map(line => line.split("\t"));
        const headRow = lines.shift();
        const metadata = lines.shift();
        console.log("Found a TSV with the header row:")
        console.log(headRow);
        // console.log("Found a TSV with the metadata row:")
        // console.log(metadata);

        //2d array is annoying, let's have an array of objects. 

        const generateURLList = function (line) {
          //in my file, the projects are in indices 13 to 22. 
          const indices = [
            line[13],
            line[14],
            line[15],
            line[16],
            line[17],
            line[18],
            line[19],
            line[20],
            line[21],
            line[22]
          ];
          var flattenList = indices.flat();
          //strips out rows that don't have 10 urls, which is most rows. 

          flattenList = flattenList.filter(function (entry) {
            if (entry) {
              return (entry.length > 0);
            }
          });
          return flattenList;
        }
        lines = lines.filter(function (line) {
          //also some of the first metadata line made it in to the entries
          //we'll strip them as they won't match our regex. 
          return (line[0].split("Project").length === 2)
        });

        var oneRowPerURL= [];

        //return in an esay to read format that's not just an array
        lines = lines.forEach(function (line) {
          function urlToObject(line, url){
            return {
              'ProjectPseudonym': line[0],
              'EndDate': line[1],
              'RecordedDate': line[2],
              'urls': url
            }
          }

          let urls = generateURLList(line);
            urls.forEach(function(url){
              oneRowPerURL.push(urlToObject(line, url));
            });
        });



        resolve({
          data: oneRowPerURL,
          numOfRows: oneRowPerURL.length,
          header: headRow
        });
      }

    });
  });
}

module.exports = {
  initFilePath: initFilePath,
  saveFile: saveFile,
  getFilePath: getFilePath,
  readTsv: readTsv
};
