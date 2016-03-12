var yaml = require('js-yaml');

var Chance = require('chance');
var chance = new Chance();

var Roll = require('roll');
var roll = new Roll();

var marked = require('marked');
marked.setOptions({
  smartypants: true
});

module.exports = function (args) {
  args = args || {};
  var generatorVars = [];

  var source = args.source || '';
  var format = args.format || 'yaml';

  if (format === 'yaml') {
    source = yaml.safeLoad(source);
  }

  var tables = source.tables || [];
  var firstTable = tables[0] || {};
  var entryPointName = source.entry_point || '';
  var entryPointTable = getTableByName(entryPointName) || firstTable;

  var ops = {
    /**
     * Right now, all we use a table for is to process its do expression.
     * In the future, we could do some stuff with metadata or whatever.
     * @param  {object} expr The table j-expression.
     * @return {object}      The result of the do statement.
     */
    table: function (expr) {
      return execute(expr.do);
    },

    /**
     * Save the result of an expression, and by default also return that.
     * @example
     * {save: "name", do: {expr}, return: true}
     * @param  {object} expr The save j-expression
     * @return {object}      The returned result, if applicable
     */
    save: function (expr) {
      var value = execute(expr.do);
      generatorVars[firstVal(expr)] = value;

      if (expr.return !== false) {
        return value;
      }
    },

    /**
     * Use a generator variable previously saved with save.
     * @param  {object} expr The use j-expression
     * @return {object}      The returned result of the var.
     */
    use: function (expr) {
      return generatorVars[firstVal(expr)];
    },

    /**
     * Parse a dice roll j-expression and return the result.
     * @example
     * {roll: "3d6+3"}
     * @param  {object} expr The roll j-expression
     * @return {int}         The result of the die roll
     */
    roll: function (expr) {
      return roll.roll(firstVal(expr)).result;
    },

    /**
     * Return the result of a different table in this generator.
     * @example
     * {roll_on: "table name"}
     * @param  {object} expr The table call j-expression
     * @return {object}      The result of the other table
     */
    roll_on: function (expr) {
      var tableToCall = getTableByName(firstVal(expr));
      return execute(tableToCall);
    },

    /**
     * Return the text from this j-expression.
     * @example
     * {text: "value"}
     * @param  {[type]} expr [description]
     * @return {[type]}      [description]
     */
    text: function (expr) {
      return firstVal(expr);
    },

    /**
     * Evaluate multiple j-expressions and join them together.
     * @example
     * {join: [{expr}, {expr}, {expr}], separator: " "}
     * @param  {object} expr The join j-expression
     * @return {object}      The results of the expressions, joined
     */
    join: function (expr) {
      var separator = expr.separator !== undefined ? expr.separator : " ";
      var subExprs = firstVal(expr);

      var resultArray = [];
      for (var i in subExprs) {
        resultArray.push(execute(subExprs[i]));
      }
      return resultArray.join(separator);
    },

    /**
     * Evaluate multiple j-expressions and add them together.
     * @example
     * {add: [{expr}, {expr}, {expr}]}
     * @param  {object} expr The add j-expression
     * @return {object}      The results of the expressions, added
     */
    add: function (expr) {
      var subExprs = firstVal(expr);
      var result = 0;

      for (var i in subExprs) {
        result += execute(subExprs[i]);
      }

      return result;
    },

    /**
     * Return a given value, based on a match against a given expression, or
     * return the default (if any).
     * @example
     * {switch: [{expr, case: value}, {expr, case_start: value, case_end: value}],
     * 	value: {expr}, default: {expr}}
     * @param  {object} expr The switch j-expression
     * @return {object}      The given value
     */
    switch: function (expr) {
      var entries = firstVal(expr);
      var value = execute(expr.value);

      for (var i in entries) {
        if ((entries[i].case_start <= value && entries[i].case_end >= value) ||
            entries[i].case == value) {
          return execute(entries[i]);
        }
      }

      if (expr.default) {
        return execute(expr.default);
      }
    },

    /**
     * Return a random parsed expression from the expr's first value.
     * @example
     * {pick_one: [{expr}, {expr}, {expr}]}
     * @param  {object} expr The pick_one j-expression
     * @return {object}      The random value
     */
    pick_one: function (expr) {
      var entries = firstVal(expr);
      var randomEntry = chance.pickone(entries);
      return execute(randomEntry);
    }
  };

  /**
   * Look up a table j-expression in this generator and return it.
   * @param  {string} name The table to find
   * @return {object}      A j-expression representing the table
   */
  function getTableByName(name) {
    for (var i in tables) {
      if (firstVal(tables[i]) == name) {
        return tables[i];
      }
    }
    return null;
  }

  /**
   * Return the first key in a j-expression
   * @param  {object} expr The j-expression
   * @return {object}      The first key
   */
  function firstKey(expr) {
    for (var firstKey in expr) {
      return firstKey;
    }
  }

  /**
   * Return the first value in a j-expression.
   * @param  {object} expr The j-expression
   * @return {object}      The first value
   */
  function firstVal(expr) {
    for (var firstKey in expr) {
      return expr[firstKey];
    }
  }

  /**
   * Execute a given j-expression, using the matching function in ops (if any).
   * @param  {object} expr The j-expression
   * @return {object}      The results of the function
   */
  function execute(expr) {
    var exprOp = firstKey(expr);

    if (ops[exprOp]) {
      return ops[exprOp](expr);
    }
  }

  return {
    reset: function () {
      generatorVars = [];
    },
    run: function () {
      this.reset();
      var results = execute(entryPointTable.do);
      return marked(results);
    }
  };
};
