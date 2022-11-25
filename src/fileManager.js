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

module.exports = {
  initFilePath: initFilePath,
  saveFile: saveFile,
  getFilePath: getFilePath
};
