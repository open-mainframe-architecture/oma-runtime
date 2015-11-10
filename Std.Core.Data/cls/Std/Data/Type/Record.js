'Composition'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    fieldDescriptors_: null
  });
  I.know({
    describesValue: function(value) {
      if (I._.Value._.Record.describes(value) && value.$type.typespace === this.typespace) {
        var fields_ = value._;
        return this.enumerateDataDescriptors(function(descriptor, key) {
          return descriptor.describesValue(fields_[key]);
        });
      }
      return false;
    },
    isPreliminary: function() {
      return !this.fieldDescriptors_;
    },
    marshalValue: function(value, expression) {
      var json = expression === value.$expr ? {} : { $: value.$expr.unparse() };
      this.enumerateDataDescriptors(function(descriptor, key) {
        descriptor.marshalField(json, value, key);
      });
      return json;
    },
    unmarshalJSON: function(json, expression) {
      var values_ = I.createTable();
      this.enumerateDataDescriptors(function(descriptor, key) {
        descriptor.unmarshalField(values_, json, key);
      });
      return this.createValue(expression, values_);
    },
    createPrototype: function() {
      var descriptors_ = this.fieldDescriptors_;
      var prototype = Object.create(I._.Value._.Record.getPrototype());
      for (var key in descriptors_) {
        descriptors_[key].buildFieldPrototype(prototype, key);
      }
      return prototype;
    },
    enumerateDataDescriptors: function(visit) {
      var descriptors_ = this.fieldDescriptors_;
      for (var key in descriptors_) {
        var descriptor = descriptors_[key];
        if (descriptor.isDataDescriptor() && visit(descriptor, key) === false) {
          return false;
        }
      }
      return true;
    },
    setDescriptors: function(descriptors_) {
      if (this.fieldDescriptors_) {
        this.bad();
      }
      this.fieldDescriptors_ = descriptors_;
    }
  });
  I.share({
    merge: function(cascade) {
      var mergure_ = I.createTable();
      for (var n = cascade.length; n--; ) {
        var descriptors_ = cascade[n].fieldDescriptors_;
        for (var key in descriptors_) {
          if (!mergure_[key]) {
            mergure_[key] = descriptors_[key];
          }
        }
      }
      return mergure_;
    }
  });
})