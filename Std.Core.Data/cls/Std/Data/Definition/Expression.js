'AbstractDefinition'.subclass(function (I) {
  "use strict";
  // I describe ASTs of type expressions that can be evaluated, unless they contain variables.
  I.know({
    // get mandatory expression if this expression is optional, otherwise get this expression
    asMandatory: I.returnThis,
    // this should already be an expression without variables that can be evaluated
    express: I.returnThis,
    // complete evaluation of this expression with evaluated subexpressions
    popEvaluation: I.doNothing,
    // start evaluation in stack-based evaluator and push subexpressions if any
    pushEvaluation: I.burdenSubclass,
    // substitute occurrences of variables with expressions
    substitute: I.returnThis
  });
  I.share({
    // substitute variables in array with expressions
    substituteExpressions: function (expressions, variables_) {
      var subs = [];
      var distinct = false;
      for (var i = 0, n = expressions.length; i < n; ++i) {
        var expression = expressions[i];
        subs[i] = expression.substitute(variables_);
        distinct = distinct || expression !== subs[i];
      }
      return distinct ? subs : expressions;
    }
  });
})