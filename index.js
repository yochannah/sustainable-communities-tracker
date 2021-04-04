var github = require('octonode');
var client = github.client(process.env.github_sustain_sw_token);

var ghrepo = client.repo('open-life-science/open-life-science.github.io');

ghrepo.info(function(_, response, server){
  console.log(_, response);
});
