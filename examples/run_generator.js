#!/usr/bin/env node

var Tablesmeerp = require('../tablesmeerp');
var fs = require('fs');

var args = process.argv.slice(2);
if (!args[0]) {
  return;
}

var yamltext = '';
try {
  yamltext = fs.readFileSync(args[0], 'utf8');
} catch (e) {
  console.log('Failed to load YAML file.');
}

var generator = new Tablesmeerp({source: yamltext, format: 'yaml'});
console.log(generator.run());
