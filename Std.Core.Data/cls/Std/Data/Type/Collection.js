//@ A collection type describes a dictionary or list value.
'Composition'.subclass(function(I) {
  "use strict";
  I.have({
    //@{Std.Data.Definition.Expression} element type expression
    elementExpression: null,
    //@{Std.Data.AbstractType} element type
    elementType: null
  });
  I.know({
    isPreliminary: function() {
      return !this.elementExpression;
    },
    //@ Assign element type and expression of this preliminary type.
    //@param expression {Std.Data.Definition.Expression} element type expression
    //@param type {Std.Data.AbstractType} element type
    //@return nothing
    //@except when this is not a preliminary type
    setElement: function(expression, type) {
      if (this.elementExpression) {
        this.bad();
      }
      this.elementExpression = expression;
      this.elementType = type;
    }
  });
})