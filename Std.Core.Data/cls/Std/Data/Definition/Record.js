//@ An AST that evaluates a record type.
'Expression'.subclass(I => {
  "use strict";
  const Descriptor = I._.Descriptor, Type = I._.Type;
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
      const definitions_ = this.fieldDefinitions_;
      const sorted = Object.getOwnPropertyNames(definitions_).sort();
      const descriptors_ = I.createTable();
      const types = sorted.length === 1 ? [fieldTypes] : fieldTypes;
      sorted.forEach((name, i) => {
        const field = definitions_[name], type = types[i];
        const annotations = I.hasEnumerables(field.annotations_) ?
          evaluation.typepace.unmarshal({ _: field.annotations_ }, '<string>') :
          null;
        descriptors_[name] = Descriptor.create(field.expression, type, annotations);
      });
      preliminary.setDescriptors(descriptors_);
    },
    pushEvaluation: function(evaluation) {
      const definitions_ = this.fieldDefinitions_;
      const sorted = Object.getOwnPropertyNames(definitions_).sort();
      evaluation.pushExpressions(sorted.map(name => definitions_[name].expression));
      return Type._.Record.create(evaluation.typespace, this);
    },
    substitute: function(variables_) {
      const fields_ = I.createTable(), definitions_ = this.fieldDefinitions_;
      let distinct = false;
      for (let key in definitions_) {
        const field = definitions_[key], expression = field.expression;
        const sub = expression.substitute(variables_);
        fields_[key] = sub === expression ? field : I.AST.createField(sub, field.annotations_);
        distinct = distinct || sub !== expression;
      }
      return distinct ? I.AST.createRecord(fields_) : this;
    }
  });
  I.nest({
    //@ An AST that evaluates a record field.
    Field: 'BaseObject'.subclass(I => {
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