var ghGetter = require("../src/app.js"),
  mocktokit = require("./mocktokit");

var assert = require('assert');

//setup environment to get the expected results.

//don't use octokit because that would query live github. this is a fake stub
const myMocktokit = mocktokit.init();

//generate data based on our fake results
ghGetter.fullRun('fakerepo', 'fakeorg', myMocktokit).then(function(result) { //

  describe('Paginated results: ', function() {
    it('should return commits correctly', function() {
      assert.equal(result.commitCount, 334);
    });
    it('should return issues+PRs correctly', function() {
      assert.equal(result.repoInfo.issues.currently_open, 29); // this needs to be fixed.
    });
    describe('should separate PRs from issues as expected', function() {
      console.log("PRs: ", result.prs);
      console.log("Issues: ", result.issues);
      it('should have fewer PRs than issues', function() {
        assert.ok(result.prs.all < result.issues.all);
      });
      it('should have fewer open PRs than total prs', function() {
        assert.equal(result.prs.open, 5);
        assert.equal(result.prs.closed, 223);
        assert.equal(result.prs.all,
          result.prs.closed + result.prs.open);
      });
      it('should have fewer open issues than total issues', function() {

        assert.equal(result.issues.open, 3298);
        assert.equal(result.issues.closed, 5184);
        assert.equal(result.issues.all,
          result.issues.closed + result.issues.open);

      });
    });

    describe('Time to close: ', function() {
      let hammerTime = result.timeToMerge.timeToClose;
      describe('should return mean time to close correctly', function() {
        it('for PRs', function(){
          assert.equal(hammerTime.pr.mean.ms,37195311);
        });
        it('for issues', function(){
          assert.equal(hammerTime.issue.mean.ms,104784230);
        });
      });
      describe('should return median time to close correctly', function() {
        it('for PRs', function(){
          assert.equal(hammerTime.pr.median.ms,2295000);
        });
        it('for issues', function(){
          assert.equal(hammerTime.issue.median.ms,176219000);
        });
      });
    });
  });



  describe('Generic Functions', function() {
    describe('Calculate median', function() {
      it('Should return a middle value with an odd number of entries', function() {
        var testArr = [5, 2, 1, 3, 4],
          median = ghGetter.calculateMedian(testArr);
        assert.equal(median, 3);
      })
      it('Should return a mean of the middle two value with an even number of entries', function() {
        var testArr = [6, 1, 5, 4, 2, 3],
          median = ghGetter.calculateMedian(testArr);
        assert.equal(median, 3.5);
      });
      it('Should handle empty arrays', function() {
        var emptyArr = [],
          emptyMedian = ghGetter.calculateMedian(emptyArr);
        assert.equal(emptyMedian, null);
      });
    });
    describe('Calculate mean', function() {
      it('Should correctly calculate the mean of an array', function() {
        var testArr = [5, 2, 1, 3, 4, 6, 7, 8, 9, 10, 13, 22, 55],
          mean = ghGetter.calculateMean(testArr);
        assert.equal(mean, 11);
      });
      it('Should handle empty arrays', function() {
        let newArr = [],
          emptyMean = ghGetter.calculateMean(newArr);
        assert.equal(emptyMean, null);
      })
    });
  });

}).catch(function(whyItMessedUp) {
  console.error("😭 It went wrong y'all");
  console.error(whyItMessedUp);
});
