//@ A descriptor of a record field.
'Object'.subclass(I => {
  "use strict";
  I.have({
    //@{Std.Data.Definition.Expression} expression of field type
    fieldExpression: null,
    //@{Std.Data.Type.Object} type of field value
    fieldType: null,
    //@{Std.Data.Value.Dictionary?} field annotations value
    fieldAnnotations: null
  });
  I.know({
    //@param expression {Std.Data.Definition.Expression} field type expression
    //@param type {Std.Data.Type.Object} field type
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
      const metaKey = `@${key}`, defaultMetaKey = `default${metaKey}`;
      if (this.fieldAnnotations) {
        I.lockProperty(prototype, defaultMetaKey, this.fieldAnnotations);
      }
      I.defineGetter(prototype, metaKey, function() {
        return this._[metaKey] || this[defaultMetaKey] || null;
      });
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
    //@param json {object} JSON object
    //@param record {Std.Data.Value.Record} record value
    //@param key {string} field name
    //@return nothing
    marshalField: function(json, record, key) {
      const metaKey = `@${key}`, typespace = this.fieldType.typespace;
      if (this.isDataDescriptor()) {
        const field = record._[key];
        if (field !== null) {
          json[key] = typespace.marshal(field, this.fieldExpression);
        }
      }
      if (record._[metaKey]) {
        json[metaKey] = typespace.marshal(record._[metaKey], '<string>');
      }
    },
    //@ Test whether given value is described by the field type.
    //@param value {*} JavaScript object or value
    //@return {boolean} true if value is described by field type, otherwise false
    testMembership: function(value) {
      return this.fieldType.testMembership(value);
    },
    //@ Unmarshal field from JSON representation and put field value in table with values.
    //@param values {Std.Table} table with field values
    //@param json {object} JSON object
    //@param key {string} field name
    //@return nothing
    unmarshalField: function(values, json, key) {
      const metaKey = `@${key}`, typespace = this.fieldType.typespace;
      if (this.isDataDescriptor()) {
        const field = json[key];
        values[key] = typespace.unmarshal(field === void 0 ? null : field, this.fieldExpression);
      }
      if (json[metaKey]) {
        values[metaKey] = typespace.unmarshal(json[metaKey], '<string>');
      }
    }
  });
})