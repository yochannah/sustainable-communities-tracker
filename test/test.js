var ghGetter = require("../src/app.js"),
mocktokit = require("./mocktokit");

var assert = require('assert');

//setup environment to get the expected results.

//don't use octokit because that would query live github. this is a fake stub
const myMocktokit = mocktokit.init();

//generate data based on our fake results
ghGetter.fullRun('fakerepo', 'fakeorg', myMocktokit).then(function(result){//

  describe('Paginated results: ', function() {
    it('should return commits correctly', function() {
      assert.equal(result.commitCount,334);
    });
      it('should return commits correctly', function() {
        assert.equal(result.commitCount,858);
      });
      it('should return issues+PRs correctly', function() {
        assert.equal(result.repoInfo.issues.currently_open,29);
      });
      it('should separate PRs from issues as expected', function() {
       console.log("prs",result.prs)
       console.log("issues",result.issues);
        assert.equal(result.prs.open,1);
        assert.equal(result.prs.closed,196);
        assert.equal(result.prs.open,
          result.prs.closed + result.prs.open);
        assert.equal(result.issues.open,28);
        assert.equal(result.issues.closed,59);
        assert.equal(result.issues.all,
          result.issues.closed + result.issues.open);

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


}).catch(function(whyItMessedUp){
  console.error("😭 It went wrong y'all");
  console.error(whyItMessedUp);
});
