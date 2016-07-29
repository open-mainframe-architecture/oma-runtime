//@ A collection type describes a dictionary or list value.
'Composition'.subclass(I => {
  "use strict";
  I.have({
    //@{Std.Data.Definition.Expression} element type expression
    elementExpression: null,
    //@{Std.Data.Type.Object} element type
    elementType: null
  });
  I.know({
    isPreliminary: function() {
      return !this.elementExpression;
    },
    //@ Assign element type and expression of this preliminary type.
    //@param expression {Std.Data.Definition.Expression} element type expression
    //@param type {Std.Data.Type.Object} element type
    //@return nothing
    setElement: function(expression, type) {
      this.elementExpression = expression;
      this.elementType = type;
    }
  });
})