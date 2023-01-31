const ghGetter = require("../src/app.js"),
  fm = require("../src/fileManager.js"),
  path = require('path'),
  urlList = require('./data_prep/fake_urllist.txt'),
  methodRunner = require("../src/singleMethod.js").methodRunner,
  mocktokit = require("./mocktokit");

const assert = require('assert');
const { getFileNameSingleMethod } = require("../src/fileManager.js");

//NOTE FOR FUTURE YOU: ALWAYS USE SYNC METHODS to read/write
// files, otherwise we end up running the
// after() TIDY UP BEFORE THE TEST IS RUN. And then you cry.

//setup environment to get the expected results.

//don't use octokit because that would query live github. this is a fake stub
const myMocktokit = mocktokit.init();

const basePath = "./test/data_prep/";
const filePath = path.join(basePath, "test_files");
const runner = new methodRunner("test", myMocktokit, filePath);

// fake params: 
const fakeParams = {
  tsvFile: path.join(basePath, "/fake_tsv.tsv"),
  method: "isActive", 
  filePath : filePath
};

let result = runner.runSingleMethod(fakeParams);
result.then(function (aggregateReport) {


  //tsv
  describe('Single Method Test Suite', function () {
    describe('TSV Reader', function () {
      it('should return the same number of urls as is in the file, including rows with multiple urls', function () {
        assert.equal(aggregateReport.urlsSubmitted, 6);
        assert.notEqual(aggregateReport.urlsSubmitted,4); 
        //If the notEqual fails, this might mean we're skipping a row, 
        //or notreading all the URLs from each row.
      });
      it('should save an aggregate report on the results', function () {
       
       let reportFile = `report_${fakeParams.method}.json`;
       let reportName = fm.getFileNameSingleMethod(fakeParams,"report");
        fm.readFile(reportName).then(function(fileContents){
          console.log('👾 file', fileContents, x);
          
          assert.equal(reportFile, "dddd");
          done(); 
        });
      });
      it('let us know if we ask for a bad method', function () {

      });
    });
    describe('Date handlers', function () {
      it('Should give the full start-end period for activity', function () {

      });
      it('wasactive should tell us if the repo was active at the start of the test period', function () {

      });
      it('isactive should tell us if the repo was active at the END of the test period', function () {

      });
      it('no repo check dates should ever be in the future', function () {

      });
    });
  });
});