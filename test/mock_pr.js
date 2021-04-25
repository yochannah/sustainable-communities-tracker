const headers = require("./data_prep/fake_header")

module.exports = {
    prs: {
      page: {
        open: {
          data: new Array(5)
        }, //3
        closed: {
          data: new Array(23)
        }, //7
        all: {
          data: new Array(28)
        } //10.
      },
      open: {
        data: new Array(100),
        headers: headers(6)
      },
      closed: {
        data: new Array(100),
        headers: headers(5)
      },
      all: {
        data: new Array(100),
        headers: headers(4)
      }
    }
  }
