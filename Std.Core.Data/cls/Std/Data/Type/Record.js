//@ A record type describes record values.
'Composition'.subclass(I => {
  "use strict";
  const Value = I._.Value;
  I.am({
    Abstract: false
  });
  I.have({
    //@{Std.Table} map field name to descriptor
    fieldDescriptors: null,
    //@[string] field names in convenient array
    fieldKeys: null
  });
  I.know({
    isPreliminary: function() {
      return !this.fieldDescriptors;
    },
    isRecord: I.returnTrue,
    marshalValue: function(value, expression) {
      const descriptors = this.fieldDescriptors;
      const json = expression === value.$expr ? {} : { $: value.$expr.unparse() };
      for (let key in descriptors) {
        descriptors[key].marshalField(json, value, key);
      }
      return json;
    },
    testMembership: function(value) {
      if (I.Data.isRecord(value) && value.$type.typespace === this.typespace) {
        const descriptors = this.fieldDescriptors, fields = value._;
        for (let key in descriptors) {
          const descriptor = descriptors[key];
          if (descriptor.isDataDescriptor() && !descriptor.testMembership(fields[key])) {
            return false;
          }
        }
        return true;
      }
      return false;
    },
    unmarshalJSON: function(json, expression) {
      const descriptors = this.fieldDescriptors, values = I.createTable();
      for (let key in descriptors) {
        descriptors[key].unmarshalField(values, json, key);
      }
      return this.createValue(expression, values);
    },
    createPrototype: function() {
      const descriptors = this.fieldDescriptors;
      const prototype = Object.create(Value._.Record.getPrototype());
      for (let key in descriptors) {
        descriptors[key].buildFieldPrototype(prototype, key);
      }
      return prototype;
    },
    //@ Get iterable descriptor keys.
    //@return {iterable} iterable string keys
    iterateDescriptorKeys: function() {
      return this.fieldKeys[Symbol.iterator]();
    },
    //@ Obtain descriptor of a record field.
    //@param key {string} unique field name
    //@return {Std.Data.Descriptor?} field descriptor or nothing
    selectDescriptor: function(key) {
      return this.fieldDescriptors[key];
    },
    //@ Set field descriptors of this preliminary record type.
    //@param descriptors {Std.Table} descriptors of this record type
    //@return nothing
    //@exception when tis record type is not preliminary
    setDescriptors: function(descriptors) {
      this.fieldDescriptors = descriptors;
      this.fieldKeys = Object.keys(descriptors);
    }
  });
  I.share({
    //@ Merge fields of record type addition.
    //@param cascade {[Std.Data.Type.Record]} added record types
    //@return {Std.Table} descriptors of merged record type
    merge: cascade => {
      const mergure = I.createTable();
      for (let n = cascade.length; n--;) {
        const descriptors = cascade[n].fieldDescriptors;
        for (let key in descriptors) {
          if (!mergure[key]) {
            mergure[key] = descriptors[key];
          }
        }
      }
      return mergure;
    }
  });
})