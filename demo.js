var glob = require('glob');

var entry = {};
glob.sync('./src/js/**/*.js').forEach(function (name) {
  console.log(name);
  var start = name.indexOf('src/') + 4;
  var end = name.length - 3;
  var eArr = [];
  var n = name.slice(start, end);
  n = n.split('/')[1];
  eArr.push(name);
  // eArr.push('babel-polyfill');
  entry[n] = eArr;
})
console.log(entry);
