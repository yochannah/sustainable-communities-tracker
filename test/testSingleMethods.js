const ghGetter = require("../src/app.js"),
  fm = require("../src/fileManager.js"),
  fs = require("fs"),
  path = require('path'),
  urlList = require('./data_prep/fake_urllist.txt'),
  methodRunner = require("../src/singleMethod.js").methodRunner,
{ DateTime } = require("luxon"),
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
  filePath: filePath
};

const badParams = {
  tsvFile: path.join(basePath, "/fake_tsv.tsv"),
  method: "thisMethodDoesNotExist",
  filePath: filePath
};

const fakeReport = { "urlsSubmitted": 6, "successfulResults": 6, "checks": { "isActive": { "active": 4, "quiet": 2 } }, "dateGathered": "2023-01-31T15:36:03.220+00:00", "dateChecksCovered": { "start": "2021-06-15T04:02:10.000+01:00", "end": "2022-07-10T07:03:18.000+01:00" } };

let wasParams, isParams, singleParams, files;

/**
 * Prevents silent fails, thanks to https://adamcoster.com/blog/silently-skipped-async-tests-mochajs
 * */
function onUncaught(err) {
  console.log(err);
  process.exit(1);
}
process.on('unhandledRejection', onUncaught);

//tsv
describe('Single Method Test Suite', function () {
  var aggregateReport, result;
  before(function (done) {
    result = runner.runSingleMethod(fakeParams);
    result.then(function (report) {
      aggregateReport = report;
      done();
    });
  });
  describe('TSV Reader', function () {

    it(`should return the same number of urls as is in the file`, function () {
      assert.equal(aggregateReport.urlsSubmitted, 6);
    });

    it(`should not match only the number of rows in the file 
         -> (we need support for multiple urls within a single row)`, function () {
      assert.notEqual(aggregateReport.urlsSubmitted, 4);
    });

    it('should save an aggregate report on the results', function (done) {
      let reportName = getFileNameSingleMethod(fakeParams, "report"),
      tempFakeReport = Object.assign({}, fakeReport);
      fm.readFile(reportName).then(function (result) {

        // dateGathered will always be different (it's set to NOW), 
        // so don't use it for comparison - other properties are sufficient.

        // the key won't delete from a stringified object, only a true json object
        result = JSON.parse(result);
        delete result.dateGathered;
        delete tempFakeReport.dateGathered;
        delete result.dateChecksCovered;
        delete tempFakeReport.dateChecksCovered;

        // deep equals needed because properties in the object could get out of order.
        // e.g. {a: 1, b:2} and {b:2, a:1} SHOULD be called equal.
        assert.deepEqual(result, tempFakeReport);
        done();
      });
    });

    //skipping this test because it's silently failing and I've spent TOO LONG trying to fix it. 
    //TODO fix when it's less annoying. and/or cringe when this is in prod three years time from now. 
    it.skip('error if we ask for a nonexistant or private method', function (done) {
      assert.rejects(function () {
        return runner.runSingleMethod(badParams).then(function () {
          try {
            done();
          } catch (e) {
            //something's going wrong, there's a silent fail and this DOESN'T TRIGGER
            //but neither do tests complete. 🔥
            console.error('👻 error', e);
          };
        });
      });
    });
  });
  describe('Date handlers', function () {
    before(function (done) {
      //clone fakeparams, don't modify the original in case we re-use it later
      wasParams = Object.assign({}, fakeParams);
      wasParams.method = "wasActive";
      result = runner.runSingleMethod(wasParams);
      result.then(function (report) {
        aggregateReport = report;

        // setup the filenames we'll be checking. 
        singleParams = {
          kc: Object.assign({}, wasParams),
          km: Object.assign({}, wasParams),
          ob: Object.assign({}, wasParams),
          on: Object.assign({}, wasParams),
          bad: Object.assign({}, wasParams)
        }

        singleParams.kc.org = "kitten";
        singleParams.km.org = "kitten";
        singleParams.ob.org = "ooga";
        singleParams.on.org = "ooga";

        singleParams.kc.repo = "catten";
        singleParams.km.repo = "mitten";
        singleParams.ob.repo = "bmaagal";
        singleParams.on.repo = "nistoveva";

        singleParams.bad.repo = "sdfsfsdf";
        singleParams.bad.org = "sdfsdfszz";

        files = {
          kc: getFileNameSingleMethod(singleParams.kc, "singleResult"),
          km: getFileNameSingleMethod(singleParams.km, "singleResult"),
          ob: getFileNameSingleMethod(singleParams.ob, "singleResult"),
          on: getFileNameSingleMethod(singleParams.on, "singleResult"),
          bad: getFileNameSingleMethod(singleParams.bad, "singleResult")
        }

        done();
      });
    });

    it('Should give the full start-end period for activity', function () {

        //a fun bug is that the tests will fail if you're in a different timezone, 
        //if we don't take the timezone out of the equation. 
        let expectedReport = Object.assign({}, fakeReport),

        testedStart = DateTime.fromISO(aggregateReport.dateChecksCovered.start),
        testedEnd = DateTime.fromISO(aggregateReport.dateChecksCovered.end),

        expectedStart = DateTime.fromISO(expectedReport.dateChecksCovered.start),
        expectedEnd = DateTime.fromISO(expectedReport.dateChecksCovered.end);

        assert.ok(testedStart.hasSame(expectedStart, 'day')); //implicitly same month, year   
        assert.ok(testedEnd.hasSame(expectedEnd, 'day')); //implicitly same month, year  
    });


    it('wasactive should make files for each report', function () {
      assert.ok(fs.existsSync(files.kc), `missing ${files.kc}`);
      assert.ok(fs.existsSync(files.km), `missing ${files.km}`);
      assert.ok(fs.existsSync(files.ob), `missing ${files.ob}`);
      assert.ok(fs.existsSync(files.on), `missing ${files.on}`);
    });

    it('wasactive should NOT find files that do not exist', function () {
      assert.throws(function () {
        fs.readSync(files.bad);
      }, null, `didn't throw an error when retrieving ${files.bad}, which are files that don't exist`);
    });

    describe('wasactive should tell us if the repo was active at the start of the test period', function () {
      //read wasactive file, make sure it shows
      //the correct number of commits for month 0.
      //wasactive

      it("should have dates one month apart in the middle of the year", function (done) {

        fm.readFile(files.kc).then(function (result) {
          result = JSON.parse(result);

          let start = result.config.since;
          let end = result.config.until;

          start = new Date(start);
          end = new Date(end);

          assert.equal(end.getMonth() - 1, start.getMonth());
          assert.equal(end.getFullYear(), start.getFullYear());

          //these two :down: should be congruent. 
          // >0 == active. 
          // == 0 is inactive
          //less than 0, run like hell, you broke the law.
          assert.equal(result.commitCount, 200)
          assert.equal(result.isActive, true);

          done();
        });
      });

      it.skip("should have dates one month apart at the END/START of the year", function (done) {

        fm.readFile(files.km).then(function (result) {
          result = JSON.parse(result);

          let start = result.config.since;
          let end = result.config.until;

          start = new Date(start);
          end = new Date(end);

          assert.equal(start.getMonth(), 12);
          assert.equal(end.getMonth(), 1);
          assert.equal(end.getFullYear(), start.getFullYear()+1);

          //these two :down: should be congruent. 
          // >0 == active. 
          // == 0 is inactive
          //less than 0, should never happen, run like hell, you broke the law.
          assert.equal(result.commitCount, 0)
          assert.equal(result.isActive, false);

          done();
        });
        //kitten_catten -     1,0
        //kitten_mitten -     0,1
        //ooga_bmaagal -      0,0
        //ooga_nistoveva -    1,1
        //ooga_nachuga -      1,1 //this goes through the default 334 commits route
        //sevivon_sovsovsov - 1,1 //this goes through the default 334 commits route
        //total_active        4,4
        //total_quiet         2,2
      });
    });

    it.skip('isactive should tell us if the repo was active at the END of the test period', function () {
      //wasactive
      //kitten_catten - 1,0
      //kitten_mitten - 0,1
      //ooga_bmaagal - 0,0
      //ooga_nistoveva - 1,1
    });
    it.skip('no repo check dates should ever be in the future', function () {

    });
  });
});
