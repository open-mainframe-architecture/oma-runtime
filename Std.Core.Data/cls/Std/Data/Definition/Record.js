//@ An AST that evaluates a record type.
'Expression'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{Std.Table} map names to field definitions
    fieldDefinitions_: null
  });
  I.know({
    //@param source {string} source text
    //@param definitions_ @{Std.Table} field definitions
    build: function(source, definitions_) {
      I.$super.build.call(this, source);
      this.fieldDefinitions_ = definitions_;
    },
    popEvaluation: function(evaluation, fieldTypes, preliminary) {
      var definitions_ = this.fieldDefinitions_;
      var sorted = Object.getOwnPropertyNames(definitions_).sort();
      var descriptors_ = I.createTable();
      var types = sorted.length === 1 ? [fieldTypes] : fieldTypes;
      sorted.forEach(function(name, i) {
        var field = definitions_[name], type = types[i];
        var annotations = I.hasEnumerables(field.annotations_) ?
          evaluation.typepace.unmarshal({ _: field.annotations_ }, '<string>') :
          null;
        descriptors_[name] = I._.Descriptor.create(field.expression, type, annotations);
      });
      preliminary.setDescriptors(descriptors_);
    },
    pushEvaluation: function(evaluation) {
      var definitions_ = this.fieldDefinitions_;
      var sorted = Object.getOwnPropertyNames(definitions_).sort();
      evaluation.pushExpressions(sorted.map(function(name) {
        return definitions_[name].expression;
      }));
      return I._.Type._.Record.create(evaluation.typespace, this);
    },
    substitute: function(variables_) {
      var fields_ = I.createTable();
      var distinct = false;
      for (var key in this.fieldDefinitions_) {
        var field = this.fieldDefinitions_[key];
        var expression = field.expression;
        var sub = expression.substitute(variables_);
        fields_[key] = sub === expression ? field : I.AST.createField(sub, field.annotations_);
        distinct = distinct || sub !== expression;
      }
      return distinct ? I.AST.createRecord(fields_) : this;
    }
  });
  I.nest({
    //@ An AST that evaluates a record field.
    Field: 'BaseObject'.subclass(function(I) {
      I.have({
        //@{Std.Data.Definition.Expression} expression of field type
        expression: null,
        //@{Std.Table} map annotation names to values
        annotations_: null
      });
      I.know({
        //@param expression {Std.Data.Definition.Expression} field type expression
        //@param annotations_ {Std.Table} field annotations
        build: function(expression, annotations_) {
          I.$super.build.call(this);
          this.expression = expression;
          this.annotations_ = I.hasEnumerables(annotations_) ? annotations_ : I.EmptyTable;
        }
      });
    })
  });
})