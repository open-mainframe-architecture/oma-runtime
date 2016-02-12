//@ An AST for a type expression can be evaluated, unless it contains variables.
'AbstractDefinition'.subclass(function (I) {
  "use strict";
  I.know({
    //@return this expression
    express: I.returnThis,
    //@ Get mandatory expression if this expression is optional. Otherwise return this expression.
    //@return {Std.Data.Definition.Expression} this expression
    asMandatory: I.returnThis,
    //@ Complete evaluation of this expression with evaluated subexpressions.
    //@param evaluator {Std.Data.Typespace._.Evaluator} stack-based type evaluator
    //@param subs {Std.Data.AbstractType|[Std.Data.AbstractType]} evaluated subexpressions
    //@param preliminary {Std.Data.AbstractType?} preliminary type from push
    //@return {Std.Data.AbstractType?} evaluated type if not preliminary
    popEvaluation: I.doNothing,
    //@ Start evaluation and push any subexpressions.
    //@param evaluator {Std.Data.Typespace._.Evaluator} stack-based type evaluator
    //@return {Std.Data.AbstractType?} nothing or type, possibly preliminary
    pushEvaluation: I.burdenSubclass,
    //@ Substitute occurrences of variables with expressions.
    //@param variables_ {Rt.Table} mapping from variable names to expressions
    //@return {Std.Data.Definition.Expression} this expression without variables
    substitute: I.returnThis
  });
  I.share({
    //@ Substitute variables in array with expressions
    //@param expressions {[Std.Data.Definition.Expression]} expressions
    //@param variables_ {Rt.Table} mapping from variable names to expressions
    //@return {[Std.Data.Definition.Expression]} expressions without variables
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