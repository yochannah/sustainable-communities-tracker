const ghGetter = require("../src/app.js"),
  fm = require("../src/fileManager.js"),
  fs = require('fs'),
  path = require('path'),
  urlList = require('./data_prep/fake_urllist.txt'),
  tsv = require('./data_prep/fake_tsv.tsv'),
  methodRunner = require("../src/singleMethod.js").methodRunner,
  mocktokit = require("./mocktokit");

const assert = require('assert');

//NOTE FOR FUTURE YOU: ALWAYS USE SYNC METHODS to read/write
// files, otherwise we end up running the
// after() TIDY UP BEFORE THE TEST IS RUN. And then you cry.

//setup environment to get the expected results.

//don't use octokit because that would query live github. this is a fake stub
const myMocktokit = mocktokit.init();

const basePath = "./test/data_prep/";
const filePath = path.join(basePath,"test_files");
const runner = new methodRunner("test", mocktokit, filePath);

// fake params: 
const fakeParams = {
  tsvFile: path.join(basePath,"/fake_tsv.tsv"),
  method: "isActive"
};



//tsv
describe('Single Method Test Suite', function () {
  describe('TSV Reader', function () {
    it('should return the same number of rows as is in the file, minus headers', function () {
      //import the tsv reader
      //read number of rows
      //count them
     let result = runner.runSingleMethod(fakeParams);
     console.log('👾 result', result);
     result.then(function(x){
      console.log('👻 x', x);
      done();
     });
    });
    it('should save an aggregate report on the results', function () {

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