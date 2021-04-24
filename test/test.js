var ghGetter = require("../src/app.js"),
mocktokit = require("./mocktokit");

var assert = require('assert');

//setup environment to get the expected results.

//don't use octokit because that would query live github. this is a fake stub
const myMocktokit = mocktokit.init();

//generate data based on our fake results
ghGetter.fullRun('fakerepo', 'fakeorg', myMocktokit).then(function(result){

  describe('Paginated commit counter: ', function() {
      it('should return correctly for paged results', function() {
        assert.equal(result.commitCount,858);
      });
  });

});
