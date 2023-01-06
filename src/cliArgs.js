const yargs = require('yargs'),
errors = require('./errors.js');
const processArgs = function() {
  return yargs
    .command('$0', 'Gather github stats for a repo', {
      month: {
        description: 'Month this stat set is being gathered. Usually 0, 6, or 12.',
        type: 'number',
        aliases: ["gather", "gatherInfo"],
        required: true
      },
      method : {
        description: 'Method to run',
        type: 'string',
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

const processSingleMethodArgs = function() {
  return yargs
    .command('$0', 'Get Activity in specified period', {
      start: {
        description: 'YYYY-MM-DD that this activity is being measured from',
        type: 'date',
        required: true
      },
      end : {
        description: 'YYYY-MM-DD that this activity is being measured from. If omitted, defaults to 12 months from start date.',
        type: 'date',
        required: false
      },
      method : {
        description: 'methodname to run',
        type: 'string',
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
      },
      tsvFile: {
        description: 'Path to a TSV with properties to parse for the method',
        alias: 'tsv',
        type: 'string'
      }
    })
    .help()
    .alias('help', 'h')
    .argv;
  }

const validate = function(argv) {
  if (!argv.urlList && !argv.url&& !argv.tsv) {
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
  processSingleMethodArgs : processSingleMethodArgs,
  validate: validate
}
