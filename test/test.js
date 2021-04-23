var ghGetter = require("../src/app.js"),
mocktokit = require("./mocktokit");

var assert = require('assert');
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

const myMocktokit = mocktokit.init();

ghGetter.fullRun('open-life-science.github.io', 'open-life-science', myMocktokit).then(function(result){
  console.log(JSON.stringify(result));
});
