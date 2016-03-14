//@ A descriptor of a record field.
'BaseObject'.subclass(function(I) {
  "use strict";
  I.have({
    //@{Std.Data.Definition.Expression} expression of field type
    fieldExpression: null,
    //@{Std.Data.AbstractType} type of field value
    fieldType: null,
    //@{Std.Data.Value.Dictionary?} field annotations value
    fieldAnnotations: null
  });
  I.know({
    //@param expression {Std.Data.Definition.Expression} field type expression
    //@param type {Std.Data.Definition.Expression} field type
    //@param annotations {Std.Data.Value.Dictionary?} annotations dictionary
    build: function(expression, type, annotations) {
      I.$super.build.call(this);
      this.fieldExpression = expression;
      this.fieldType = type;
      this.fieldAnnotations = annotations;
    },
    //@ Add field and metafield access to prototype of record type.
    //@param prototype {Std.Data.Value.Record} prototypical record value
    //@param key {string} field name
    //@return nothing
    buildFieldPrototype: function(prototype, key) {
      if (this.isDataDescriptor()) {
        I.defineGetter(prototype, key, function() {
          return this._[key];
        });
      }
      var metaKey = '@' + key, defaultMetaKey = 'default' + metaKey;
      I.defineGetter(prototype, metaKey, function() {
        return this._[metaKey] || this[defaultMetaKey] || null;
      });
      if (this.fieldAnnotations) {
        I.defineConstant(prototype, defaultMetaKey, this.fieldAnnotations);
      }
    },
    //@ Test whether given value is described by the field type.
    //@param value {any} JavaScript object or value
    //@return {boolean} true if value is described by field type, otherwise false
    describesValue: function(value) {
      return this.fieldType.describesValue(value);
    },
    //@ Get default value of meta field with annotations.
    //@return {Std.Data.Value.Dictionary?} optional dictionary value
    getAnnotations: function() {
      return this.fieldAnnotations;
    },
    //@ Does this descriptor describe a data field? If not, the field is not (un)marshalled.
    //@return {boolean} true if this is a data field, otherwise false
    isDataDescriptor: I.returnTrue,
    //@ Marshal field value and put result in JSON object.
    //@param json {Object} JSON object
    //@param record {Std.Data.Value.Record} record value
    //@param key {string} field name
    //@return nothing
    marshalField: function(json, record, key) {
      var metaKey = '@' + key, typespace = this.fieldType.typespace;
      if (this.isDataDescriptor()) {
        var field = record._[key];
        if (field !== null) {
          json[key] = typespace.marshal(field, this.fieldExpression);
        }
      }
      if (record._[metaKey]) {
        json[metaKey] = typespace.marshal(record._[metaKey], '<string>');
      }
    },
    //@ Unmarshal field from JSON representation and put field value in table with values.
    //@param values_ {Std.Table} table with field values
    //@param json {Object} JSON object
    //@param key {string} field name
    //@return nothing
    unmarshalField: function(values_, json, key) {
      var metaKey = '@' + key, typespace = this.fieldType.typespace;
      if (this.isDataDescriptor()) {
        var field = json[key];
        values_[key] = typespace.unmarshal(field === void 0 ? null : field, this.fieldExpression);
      }
      if (json[metaKey]) {
        values_[metaKey] = typespace.unmarshal(json[metaKey], '<string>');
      }
    }
  });
})