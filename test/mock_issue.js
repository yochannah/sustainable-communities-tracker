const headers = require("./data_prep/fake_header")

module.exports = {
  page: {
    "open": {
      data: new Array(3)
    }, //3
    "closed": {
      data: new Array(7)
    }, //7
    "all": {
      data: new Array(10)
    } //10.
  },
  "open": {
    data: new Array(100),
    headers: headers(3)
  },
  "closed": {
    data: new Array(100),
    headers: headers(55)
  },
  "all": {
    data: new Array(100),
    headers: headers(88)
  },
  labels: {
    'hacktoberfest': {
      data: new Array(2)
    }, //2
    'good first bug': {
      data: new Array(9)
    }, //9
    'help wanted': {
      data: new Array(11)
    } //11.
  }
}
