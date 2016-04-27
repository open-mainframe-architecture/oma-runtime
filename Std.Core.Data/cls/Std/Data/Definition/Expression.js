//@ An AST for a type expression can be evaluated, unless it contains variables.
'AbstractDefinition'.subclass(I => {
  "use strict";
  I.know({
    //@return this expression
    express: I.returnThis,
    //@ Get mandatory expression if this expression is optional. Otherwise return this expression.
    //@return {Std.Data.Definition.Expression} this expression
    asMandatory: I.returnThis,
    //@ Complete evaluation of this expression with evaluated subexpressions.
    //@param evaluation {Std.Data.Typespace._.Evaluation} stack-based type evaluation
    //@param subs {Std.Data.AbstractType|[Std.Data.AbstractType]} evaluated subexpressions
    //@param preliminary {Std.Data.AbstractType?} preliminary type from push
    //@return {Std.Data.AbstractType?} evaluated type if not preliminary
    popEvaluation: I.doNothing,
    //@ Start evaluation and push any subexpressions.
    //@param evaluation {Std.Data.Typespace._.Evaluation} stack-based type evaluation
    //@return {Std.Data.AbstractType?} nothing or type, possibly preliminary
    pushEvaluation: I.burdenSubclass,
    //@ Substitute occurrences of variables with expressions.
    //@param variables_ {Std.Table} mapping from variable names to expressions
    //@return {Std.Data.Definition.Expression} this expression without variables
    substitute: I.returnThis
  });
  I.share({
    //@ Substitute variables in array with expressions
    //@param expressions {[Std.Data.Definition.Expression]} expressions
    //@param variables_ {Std.Table} mapping from variable names to expressions
    //@return {[Std.Data.Definition.Expression]} expressions without variables
    substituteExpressions: function(expressions, variables_) {
      const subs = [];
      let distinct = false;
      for (let expression of expressions) {
        const substitution = expression.substitute(variables_);
        subs.push(substitution);
        distinct = distinct || expression !== substitution;
      }
      return distinct ? subs : expressions;
    }
  });
})