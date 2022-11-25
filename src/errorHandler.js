const errorFilePath = "errorlog_";
const fs = require('fs');

const errToFile = function (errFileName) {
  fs.appendFile(errFileName, errorString, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log('saved error data to ' + errFileName);
  });
}

// General error handler method to re-use as much as possible please
const httpError = function (httpError, freeText, ownerRepo) {
  errorString = `|-🙈 Error for ${ownerRepo.org}/${ownerRepo.repo}
   |- ${freeText}
   |- ${httpError.status} url ${httpError.request.url};
   `;
  console.log(errorString);
  if (httpError.status == 403) {
    throw "🚨 We're forbidden and possibly ratelimited.";
  }

  let errFileName = [errorFilePath,
    httpError.status,
    ownerRepo.org,
    ownerRepo.repo
  ].join("_");

  errToFile(errFileName);

}

const fileError = function (file, freeText, ownerRepo) {
  errorString = `|-🙈 Error for ${ownerRepo.org}/${ownerRepo.repo}
   |- ${freeText}
   |- File: ${file}.;
   `;
  console.log(errorString);

  let errFileName = [errorFilePath, 
    "file",
    ownerRepo.org,
    ownerRepo.repo
  ].join("_");

  errToFile(errFileName);
}



module.exports = {
  httpError: httpError,
  fileError : fileError
}
