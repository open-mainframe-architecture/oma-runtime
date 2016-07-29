//@ A record type expression.
'Expression'.subclass(I => {
  "use strict";
  const Type = I._.Type;
  I.am({
    Abstract: false
  });
  I.have({
    //@{Std.Table} map names to field definitions
    fieldDefinitions: null
  });
  I.know({
    //@param source {string} source text
    //@param definitions @{Std.Table} field definitions
    build: function(source, definitions) {
      I.$super.build.call(this, source);
      this.fieldDefinitions = definitions;
    },
    popEvaluation: function(evaluation, fieldTypes, preliminary) {
      const typespace = evaluation.typespace;
      const definitions = this.fieldDefinitions;
      const sorted = Object.keys(definitions).sort();
      const descriptors = I.createTable();
      const types = sorted.length === 1 ? [fieldTypes] : fieldTypes;
      sorted.forEach((name, i) => {
        const field = definitions[name], type = types[i];
        const annotations = I.hasEnumerables(field.annotations) ?
          typespace.unmarshal({ _: field.annotations }, '<string>') :
          null;
        descriptors[name] = typespace.createDescriptor(field.expression, type, annotations);
      });
      preliminary.setDescriptors(descriptors);
    },
    pushEvaluation: function(evaluation) {
      const definitions = this.fieldDefinitions;
      const sorted = Object.keys(definitions).sort();
      evaluation.pushExpressions(sorted.map(name => definitions[name].expression));
      return Type._.Record.create(evaluation.typespace, this);
    },
    substitute: function(variables) {
      const subs = I.createTable(), definitions = this.fieldDefinitions;
      let distinct = false;
      for (let key in definitions) {
        const field = definitions[key], expression = field.expression;
        const sub = expression.substitute(variables);
        subs[key] = sub === expression ? field :
          I.Data.TypeDefinitionLanguage.createField(sub, field.annotations);
        distinct = distinct || sub !== expression;
      }
      return distinct ? I.Data.TypeDefinitionLanguage.createRecord(subs) : this;
    }
  });
  I.nest({
    //@ A record field expression.
    Field: 'Std.Object'.subclass(I => {
      I.have({
        //@{Std.Data.Definition.Expression} expression of field type
        expression: null,
        //@{Std.Table} map annotation names to values
        annotations: null
      });
      I.know({
        //@param expression {Std.Data.Definition.Expression} field type expression
        //@param annotations {Std.Table} field annotations
        build: function(expression, annotations) {
          I.$super.build.call(this);
          this.expression = expression;
          this.annotations = I.hasEnumerables(annotations) ? annotations : I.EmptyTable;
        }
      });
    })
  });
})