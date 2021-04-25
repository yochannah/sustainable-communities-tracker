function fakePaginatedHeader(numOfPages) {
  return {
    "link": "<https://api.github.com/repositories/207777561/commits?per_page=100&page=2>; rel=\"next\", <https://api.github.com/repositories/207777561/commits?per_page=100&page=" +
      numOfPages + ">; rel=\"last\""
  };
}

module.exports = fakePaginatedHeader;
