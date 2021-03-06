const fetch = require('node-fetch');

// 请求仓库的基类(会带上token)
function requestNPM(option) {
  return fetch(option.url, {
    method: option.method || 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${option.token}`,
    },
  }).then(res => res.json());
}

// 查询仓库所有包
function getPackages(option) {
  return requestNPM({
    url: `${option.url}/-/verdaccio/search/**`,
    token: option.token,
    method: 'GET',
  }).then(response => {
    const packageRequests = response
      .map(item => item.name)
      .map(name =>
        requestNPM({
          url: `${option.url}/-/verdaccio/sidebar/${name}`,
          method: 'GET',
          token: option.token,
        }),
      );
    return Promise.all(packageRequests).then(responses => {
      return responses.map(item => {
        return {
          title: item._id,
          tags: Object.keys(item.versions),
          lastest: item['dist-tags'].latest,
        };
      });
    });
  });
}

getPackages({
  url: 'http://npm.xxgtalk.cn',
  token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWFsX2dyb3VwcyI6WyJ4aWV4aW5nZW4iXSwibmFtZSI6InhpZXhpbmdlbiIsImdyb3VwcyI6WyJ4aWV4aW5nZW4iLCIkYWxsIiwiJGF1dGhlbnRpY2F0ZWQiLCJAYWxsIiwiQGF1dGhlbnRpY2F0ZWQiLCJhbGwiLCJ4aWV4aW5nZW4iXSwiaWF0IjoxNTgzMDUyOTc5LCJuYmYiOjE1ODMwNTI5NzksImV4cCI6MTU4MzY1Nzc3OX0.zPnpQjxNQyGi07579w1cVe4GwnHCwHDZ3uGJyYdOa4o',
});
