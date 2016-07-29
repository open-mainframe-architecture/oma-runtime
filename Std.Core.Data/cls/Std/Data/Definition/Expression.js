//@ A type expression can be evaluated, unless it contains variables.
'Definition.Object'.subclass(I => {
  "use strict";
  I.know({
    //@return this expression
    express: I.returnThis,
    //@ Get mandatory expression if this expression is optional. Otherwise return this expression.
    //@return {Std.Data.Definition.Expression} this expression
    asMandatory: I.returnThis,
    //@ Complete evaluation of this expression with evaluated subexpressions.
    //@param evaluation {Std.Data.Typespace.$._.Evaluation} stack-based type evaluation
    //@param subs {Std.Data.Type.Object|[Std.Data.Type.Object]} evaluated subexpressions
    //@param preliminary {Std.Data.Type.Object?} preliminary type from push
    //@return {Std.Data.Type.Object?} evaluated type if not preliminary
    popEvaluation: I.doNothing,
    //@ Start evaluation and push any subexpressions.
    //@param evaluation {Std.Data.Typespace.$._.Evaluation} stack-based type evaluation
    //@return {Std.Data.Type.Object?} nothing or type, possibly preliminary
    pushEvaluation: I.burdenSubclass,
    //@ Substitute occurrences of variables with expressions.
    //@param variables {Std.Table} mapping from variable names to expressions
    //@return {Std.Data.Definition.Expression} this expression without variables
    substitute: I.returnThis
  });
  I.share({
    //@ Substitute variables in array with expressions
    //@param expressions {[Std.Data.Definition.Expression]} expressions
    //@param variables {Std.Table} mapping from variable names to expressions
    //@return {[Std.Data.Definition.Expression]} expressions without variables
    substituteExpressions: (expressions, variables) => {
      const subs = expressions.map(expression => expression.substitute(variables));
      let distinct = expressions.some((expression, i) => expression !== subs[i]);
      return distinct ? subs : expressions;
    }
  });
})