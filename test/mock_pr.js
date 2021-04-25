const headers = require("./data_prep/fake_header")

module.exports = {
  page: {
    open: {
      data: new Array(5)
    },
    closed: {
      data: new Array(23)
    },
    all: {
      data: new Array(28)
    }
  },
  open: {
    data: new Array(100),
    headers: headers(2)
  },
  closed: {
    data: new Array(100),
    headers: headers(3)
  },
  all: {
    data: new Array(100),
    headers: headers(3)
  }
}
