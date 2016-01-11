'Expression'.subclass(function (I) {
  "use strict";
  // I describe an AST for record types.
  I.am({
    Abstract: false
  });
  I.have({
    fieldDefinitions_: null
  });
  I.know({
    build: function (source, definitions_) {
      I.$super.build.call(this, source);
      this.fieldDefinitions_ = definitions_;
    },
    popEvaluation: function (evaluator, fieldTypes, preliminary) {
      var definitions_ = this.fieldDefinitions_;
      var sorted = Object.getOwnPropertyNames(definitions_).sort();
      var descriptors_ = I.createTable();
      var types = sorted.length === 1 ? [fieldTypes] : fieldTypes;
      for (var i = 0, n = sorted.length; i < n; ++i) {
        var field = definitions_[sorted[i]];
        var descriptor = I._.Descriptor.create(field.expression, types[i], field.annotations_);
        descriptors_[sorted[i]] = descriptor;
      }
      preliminary.setDescriptors(descriptors_);
    },
    pushEvaluation: function (evaluator) {
      var definitions_ = this.fieldDefinitions_;
      var sorted = Object.getOwnPropertyNames(definitions_).sort();
      for (var i = 0, n = sorted.length; i < n; ++i) {
        sorted[i] = definitions_[sorted[i]].expression;
      }
      evaluator.pushExpressions(sorted);
      return I._.Type._.Record.create(evaluator.typespace, this);
    },
    substitute: function (variables_) {
      var fields_ = I.createTable();
      var distinct = false;
      for (var key in this.fieldDefinitions_) {
        var field = this.fieldDefinitions_[key];
        var expression = field.expression;
        var sub = expression.substitute(variables_);
        fields_[key] = sub === expression ? field : I.Cache.createField(sub, field.annotations_);
        distinct = distinct || sub !== expression;
      }
      return distinct ? I.Cache.createRecord(fields_) : this;
    }
  });
  I.nest({
    Field: 'BaseObject'.subclass(function (I) {
      I.have({
        expression: null,
        annotations_: null
      });
      I.know({
        build: function (expression, annotations_) {
          I.$super.build.call(this);
          this.expression = expression;
          this.annotations_ = I.hasEnumerables(annotations_) ? annotations_ : I.EmptyTable;
        }
      });
    })
  });
})