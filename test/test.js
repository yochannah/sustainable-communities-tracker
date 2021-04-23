var ghGetter = require("../src/app.js");

var assert = require('assert');
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

ghGetter.fullRun('open-life-science.github.io', 'open-life-science').then(function(result){
  console.log(JSON.stringify(result));
});
