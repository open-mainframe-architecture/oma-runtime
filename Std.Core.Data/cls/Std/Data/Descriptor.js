'BaseObject'.subclass(function (I) {
  "use strict";
  // I describe a descriptor of a record field.
  I.have({
    // expression of field type
    fieldExpression: null,
    // type of field value
    fieldType: null,
    // table with annotations
    fieldAnnotations_: null
  });
  I.know({
    build: function (expression, type, annotations_) {
      I.$super.build.call(this);
      this.fieldExpression = expression;
      this.fieldType = type;
      this.fieldAnnotations_ = annotations_;
    },
    buildFieldPrototype: function (prototype, key) {
      if (this.isDataDescriptor()) {
        I.defineGetter(prototype, key, function () {
          return this._[key];
        });
      }
      var metaKey = '@' + key, defaultMetaKey = 'default' + metaKey;
      I.defineGetter(prototype, metaKey, function () {
        return this._[metaKey] || this[defaultMetaKey] || null;
      });
      var fieldAnnotations_ = this.fieldAnnotations_;
      if (I.hasEnumerables(fieldAnnotations_)) {
        var dictionary = this.fieldType.typespace.unmarshal({ _: fieldAnnotations_ }, '<string>');
        I.defineConstant(prototype, defaultMetaKey, dictionary);
      }
    },
    // test whether given value is described by the field type
    describesValue: function (value) {
      return this.fieldType.describesValue(value);
    },
    // does this descriptor describe a data field?
    isDataDescriptor: I.returnTrue,
    // marshal field value and put result in JSON object
    marshalField: function (json, record, key) {
      var metaKey = '@' + key, typespace = this.fieldType.typespace;
      if (record._[metaKey]) {
        json[metaKey] = typespace.marshal(record._[metaKey], '<string>');
      }
      var field = record._[key];
      if (field !== null) {
        json[key] = typespace.marshal(field, this.fieldExpression);
      }
    },
    // unmarshal field from JSON representation and put field value in table with values
    unmarshalField: function (values_, json, key) {
      var metaKey = '@' + key, typespace = this.fieldType.typespace;
      if (json[metaKey]) {
        values_[metaKey] = typespace.unmarshal(json[metaKey], '<string>');
      }
      var field = json[key];
      values_[key] = typespace.unmarshal(field === void 0 ? null : field, this.fieldExpression);
    }
  });
})