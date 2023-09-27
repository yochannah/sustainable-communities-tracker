
const headers = require("./fake_header"),
 closeTimes = require("./fake_times_to_close");

function isClosed(state, i) {
  //this function returns boolean false for open if state is open,
  // true for closed if the state is closed,
  // or a mixture of both if the state is "all"
  let states = ["closed", "open"]; // I hope that's all there is
  //some should be open and some closed
  if((state == "all") && i) {
    // the modulus (remainder) operator allows us to alternately select
    // indexes 0 or 1 in an array length of 2.
    return states[i % state.length] == "closed";
  } else {
    return state == "closed";
  }
}

function fakeIssues(howMany, isPrOrIssue, state) {
  let fakeIssues = [],
  prOrIssue,
  now = new Date();

  for (i = 0; i < howMany; i++) {

    //some issues need to be PRss, because that's how github does it even if it's
    // really fluffing confusing.
    if ((isPrOrIssue == "issue") && (i % 2 === 0)){
      prOrIssue = "pr"; // half of issues should be PRs
    } else {
      prOrIssue = isPrOrIssue;
    }

    let isItClosed = isClosed(state,i),
    response = {
      id: new Date().valueOf() +i, //this is hacky, if we ever care about ids
                                   //right now we don't really. But be aware.
      created_at: now - closeTimes[i],
      closed: isClosed(state,i),
      pr_or_issue: prOrIssue,
    }
    if (isItClosed) {
      response.closed_at = now;
      //most should be merged at the same time as the close, but not all
      if ((i%5) !== 0) {
        response.merged_at = now;
      }
    }
    if (prOrIssue == "pr") {
      response.pull_request = true;
    }
    fakeIssues.push(response);
  }
  return fakeIssues;
}

module.exports = fakeIssues;
