const headers = require("./data_prep/fake_header")

module.exports = {

    page: {
      data: new Array(34)
    },
    data: new Array(100),
    headers: headers(4)

}
