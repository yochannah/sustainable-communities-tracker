const fs = require('fs');
const path = require('path');
const errorHandler = require('./errorHandler.js');

const initFilePath = function (month, filePath) {
  const thePath = getFilePath(filePath, month);
  console.log("⏩ output files will save to", thePath);
  fs.mkdirSync(thePath, {
    recursive: true
  }, function (error) {
    if (error) {
      errorHandler.fileError(filePath, error);
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
  if (typeof contents === "object") {
    contents = JSON.stringify(contents);
  }
  fs.writeFileSync(fileName, contents, function (err) {
    if (err) {
      errorHandler.fileError(filePath, err);
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
        errorHandler.fileError(somePath, err);
        reject();
      } else {
        var lines = data.split("\n");
        lines = lines.map(line => line.split("\t"));
        const headRow = lines.shift();
        console.log(`Found a TSV with ${lines.length} lines and the header row:`)
        console.log(headRow);

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

        var oneRowPerURL = [];

        //return in an esay to read format that's not just an array
        lines = lines.forEach(function (line) {
          function urlToObject(line, url) {
            return {
              'ProjectPseudonym': line[0],
              'EndDate': line[1],
              'RecordedDate': line[2],
              'urls': url
            }
          }

          let urls = generateURLList(line);
          urls.forEach(function (url) {
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

function readFile(somePath) {
  return new Promise(function (resolve, reject) {
    fs.readFile(somePath, "utf8", function (err, data) {
      if (err) {
        errorHandler.fileError(somePath, err);
        reject();
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * Compose a filepath/name string for a single method record or report file. 
 * @param {Object} config
 * @param {string} config.method method being run. Must be one of the public methods.
 * @param {string} config.filePath folder where the results are to be stored. 
 * @param {string} config.org
 * @param {string} config.repo
 * @returns {string} filepath
 * */
function getFileNameSingleMethod(config, fileType) {
  let response;
  let c = config; //sugar to keep our lines shorter. 
  let isConfigValid = propertyExists(["filePath", "method"], config);
  if (!isConfigValid) {
    errorHandler.generalError(config, `🙃 ${fileType} error`)
  }
  try {
    switch (fileType) {
      case 'report': {
        if (propertyExists(["filePath", "method"], config)) {
          response = path.join(c.filePath, `report_${c.method}.json`);
        } else { errorHandler.generalError(config,  `${fileType}`); }
        break;
      }
      case 'singleResult': {
        if (propertyExists(["filePath", "method", "org", "repo"], config)) {
        response = path.join(c.filePath, `${c.method}_${c.org}_${c.repo}.json`);
      } else { errorHandler.generalError(config, `${fileType}`); }
        break;
      }
      default: {
        console.error(`${fileType} isn't a registered file name method. Please update fileManager.getFileNameSingleMethod to support it, or figure out what bug just happened.`);
        response = "ERROR";
      }

    }
  } catch (e) {
    errorHandler.generalError(e, `error building path for ${fileType}, config: ${config}`)
  }
  return response;
}

  /**
   * Check if a given property or array of properties is set to something truthy
   * if a property is set but falsy, (e.g. null) it should fail too.  
   * @param {string|Array} params - will check one or multiple string property keys
   * @param {Object} objectToCheck - the object to check whether it contains @params
   * */
function propertyExists(params, objectToCheck) {
  /**
   * Check if a given SINGLE property is set to something truthy. 
   * It's here inside to keep code DRY and consistent since we use it twice.
   * if a property is set but falsy, (e.g. null) it should fail too.  
   * @inner
   * @param {string} theParam - will check one property keys
   * @param {Object} theObject - the object to check whether it contains @theParam
   * */
  function isTruthy(theParam, theObject) {
    return theObject.hasOwnProperty(theParam) && theObject[theParam];
  }
  //returns true only if all params are set. 
  if (Array.isArray(params)) {
    return params.reduce(function (prevVal, currentVal) {
      return prevVal && isTruthy(currentVal, objectToCheck);
    }, true);
  } else {
    return isTruthy(params, objectToCheck);
  }
}

module.exports = {
  initFilePath: initFilePath,
  saveFile: saveFile,
  getFilePath: getFilePath,
  readTsv: readTsv,
  readFile: readFile,
  getFileNameSingleMethod: getFileNameSingleMethod
};
