var Tablesmeerp = require('../tablesmeerp');
var fs = require('fs');

var yamltext = '';
try {
  yamltext = fs.readFileSync(__dirname + '/world_design.yaml', 'utf8');
} catch (e) {
  console.log('Failed to load YAML file.');
}

var generator = new Tablesmeerp({source: yamltext, format: 'yaml'});
console.log(generator.run());
