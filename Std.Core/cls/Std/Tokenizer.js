'Object'.subclass(I => {
  "use strict";
  I.have({
    //@{[regexp]} sticky regular expressions
    tokenPatterns: null,
    //@{[function]} corresponding token factory of sticky pattern
    tokenFactories: null,
  });
  I.know({
    //@param tokens {object|Std.Table} mapping from source of regular expression to token factory
    build: function(tokens) {
      I.$super.build.call(this);
      const patterns = this.tokenPatterns = [], factories = this.tokenFactories = [];
      // 'flatten' table with pattern and factory arrays
      for (let re in tokens) {
        patterns.push(new RegExp(re, 'y'));
        factories.push(tokens[re]);
      }
    },
    //@ Iterate over tokens in source string.
    //@param s {string} string to tokenize
    //@return {iterable} iterable tokens
    iterate: function* (s) {
      const factories = this.tokenFactories, patterns = this.tokenPatterns;
      const significant = /\S/g, n = patterns.length;
      significant.lastIndex = 0;
      for (let significantMatch, i; (significantMatch = significant.exec(s));) {
        for (i = 0; i < n; ++i) {
          patterns[i].lastIndex = significantMatch.index;
          const patternMatch = patterns[i].exec(s);
          if (patternMatch) {
            const stop = significant.lastIndex = patternMatch.index + patternMatch[0].length;
            // create token with factory of matching pattern and yield it
            yield factories[i](s, patternMatch.index, stop);
            // break loop and continue to find next token
            break;
          }
        }
        // fail if all patterns were tested, but none matched
        if (i === n) {
          I.fail(`unknown token at offset ${significantMatch.index} in "${s}"`);
        }
      }
    }
  });
})