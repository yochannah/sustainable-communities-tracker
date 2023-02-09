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
  console.log('👾 httpError', Object.keys(httpError),freeText, ownerRepo);

  if (httpError.status == 404) {
    console.debug(`🔍 Can't find ${ownerRepo.org}/${ownerRepo.repo}`);
  } else {
    errorString = `|-🙈 Error for ${ownerRepo.org}/${ownerRepo.repo}
   |- ${freeText}
   |- ${httpError.status} url ${httpError.request.url};
   `;
    console.error(errorString);
    if (httpError.status == 403) {
      throw new Error("🚨 We're forbidden and possibly ratelimited.");
    }
  }

  let errFileName = [errorFilePath,
    httpError.status,
    ownerRepo.org,
    ownerRepo.repo
  ].join("_");

  errToFile(errFileName);
}

const generalError = function (someVar, freeText) {
  throw new Error(`👿  ${freeText} >> ${someVar}`);
}

const fileError = function (file, freeText, ownerRepo) {
  let errorString;
  if (ownerRepo) {
  errorString = `|-🙈 Error for ${ownerRepo.org}/${ownerRepo.repo}
   |- ${freeText}
   |- File: ${file}.;
   `;


  let errFileName = [errorFilePath,
    "file",
    ownerRepo.org,
    ownerRepo.repo
  ].join("_");

  errToFile(errFileName);
} else {
  errorString = `${file}, ${freeText}`;
}
console.log(errorString);
}



module.exports = {
  httpError: httpError,
  fileError: fileError,
  generalError: generalError
}
