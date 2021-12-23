const errorFilePath = "errorlog_";
const fs = require('fs');

// General error handler method to re-use as much as possible please
const httpError = function(httpError, freeText, ownerRepo) {
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

  fs.appendFile(errFileName, errorString, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log('saved error data to ' + errFileName);
  });

}

module.exports = {
  httpError: httpError
}
