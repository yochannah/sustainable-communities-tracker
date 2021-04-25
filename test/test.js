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
  });



  // assert.equal(result.prs.open,1);
  // assert.equal(result.prs.closed,196);
  // assert.equal(result.prs.open,
  //   result.prs.closed + result.prs.open);
  // assert.equal(result.issues.open,28);
  // assert.equal(result.issues.closed,59);
  // assert.equal(result.issues.all,
  //   result.issues.closed + result.issues.open);


}).catch(function(whyItMessedUp) {
  console.error("😭 It went wrong y'all");
  console.error(whyItMessedUp);
});
