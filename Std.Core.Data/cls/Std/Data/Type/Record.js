//@ A record type describes record values.
'Composition'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{Std.Table} map field name to descriptor
    fieldDescriptors_: null
  });
  I.know({
    describesValue: function(value) {
      if (I._.Value._.Record.describes(value) && value.$type.typespace === this.typespace) {
        var descriptors_ = this.fieldDescriptors_;
        var fields_ = value._;
        for (var key in descriptors_) {
          var descriptor = descriptors_[key];
          if (descriptor.isDataDescriptor() && !descriptor.describesValue(fields_[key])) {
            return false;
          }
        }
        return true;
      }
      return false;
    },
    isPreliminary: function() {
      return !this.fieldDescriptors_;
    },
    marshalValue: function(value, expression) {
      var descriptors_ = this.fieldDescriptors_;
      var json = expression === value.$expr ? {} : { $: value.$expr.unparse() };
      for (var key in descriptors_) {
        descriptors_[key].marshalField(json, value, key);
      }
      return json;
    },
    unmarshalJSON: function(json, expression) {
      var descriptors_ = this.fieldDescriptors_, values_ = I.createTable();
      for (var key in descriptors_) {
        descriptors_[key].unmarshalField(values_, json, key);
      }
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
    //@ Enumerate field descriptors of this record type.
    //@param visit {Std.Closure} called with field descriptor and name
    //@return {boolean} false if a visit returned false, otherwise true
    enumerateDescriptors: function(visit) {
      return I.enumerate(this.fieldDescriptors_, visit);
    },
    //@ Set field descriptors of this preliminary record type.
    //@param descriptors_ {Std.Table} descriptors of this record type
    //@return nothing
    //@exception when tis record type is not preliminary
    setDescriptors: function(descriptors_) {
      if (this.fieldDescriptors_) {
        this.bad();
      }
      this.fieldDescriptors_ = descriptors_;
    }
  });
  I.share({
    //@ Merge fields of record type addition.
    //@param cascade {[Std.Data.Type.Record]} added record types
    //@return {Std.Table} descriptors of merged record type
    merge: function(cascade) {
      var mergure_ = I.createTable();
      for (var n = cascade.length; n--;) {
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