#!/usr/bin/env node

'use strict';

var fs = require('fs');
var argparse = require('argparse');

var Tablesmeerp = require('..');

var cli = new argparse.ArgumentParser({
  prog:     'tablesmeerp',
  version:  require('../package.json').version,
  addHelp:  true
});

cli.addArgument([ 'file' ], {
  help:   'File to read, utf-8 encoded without BOM',
  nargs:  '?',
  defaultValue: false
});

var options = cli.parseArgs();

function readFile(filename, encoding, callback) {
  if (!options.file) {
    console.error('No file to use')
    process.exit(2);
  } else {
    fs.readFile(filename, encoding, callback);
  }
}

readFile(options.file, 'utf8', function (error, input) {
  var generator, output;

  if (error) {
    if (error.code === 'ENOENT') {
      console.error('File not found: ' + options.file);
      process.exit(2);
    }

    console.error(
      options.trace && error.stack ||
      error.message ||
      String(error));

    process.exit(1);
  }

  try {
    generator = new Tablesmeerp({source: input, format: 'yaml'});
    output = generator.run();
  } catch (err) {
    console.error(
      options.trace && err.stack ||
      err.message ||
      String(err));

    process.exit(1);
  }

  console.log(output);

  process.exit(0);
});
