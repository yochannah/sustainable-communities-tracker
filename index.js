const { Octokit } = require("@octokit/core");

const octokit = new Octokit({
  auth: process.env.github_sustain_sw_token,
});

var ghrepo = 'open-life-science/open-life-science.github.io';


// Start function
const start = async function() {
  const result = await octokit.request('GET /repos/{owner}/{repo}/community/code_of_conduct', {
      "owner": 'open-life-science',
      "repo": 'open-life-science.github.io',
      "mediaType": {'previews': ['scarlet-witch']}})
  console.log(result);
}

// Call start
start();
