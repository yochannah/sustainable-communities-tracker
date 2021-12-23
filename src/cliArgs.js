const yargs = require('yargs');
const processArgs = function() {
  return yargs
    .command('$0', 'Gather github stats for a repo', {
      month: {
        description: 'Month this stat set is being gathered. Usually 0, 6, or 12.',
        type: 'number',
        aliases: ["gather", "gatherInfo"],
        required: true
      }
    })
    .options({
      urlList: {
        description: 'Filepath to a list of URLs to check. One per row.',
        alias: 'urls',
        type: 'string'
      },
      url: {
        description: 'Single URL to check - format: https://github.com/org/repo',
        alias: 'repo',
        type: 'string'
      }
    })
    .help()
    .alias('help', 'h')
    .argv;
}

const validate = function(argv) {
  if (!argv.urlList && !argv.url) {
    console.error(errors.needUrls);
    return false;
  }
  if (argv.urlList && argv.url) {
    console.error(errors.tooManyArgs);
    return false;
  }
  return true;
}


module.exports = {
  processArgs: processArgs,
  validate: validate
}
