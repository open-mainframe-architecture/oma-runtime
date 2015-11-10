'AbstractValue'.subclass(function(I) {
  "use strict";
  I.know({
    $each: function(visit) {
      var this_ = this._;
      return this.$type.enumerateDataDescriptors(function(descriptor, key) {
        return visit(this_[key], key);
      });
    },
    $equals: function(that) {
      var this_ = this._, that_ = that._;
      return this.$type.enumerateDataDescriptors(function(descriptor, key) {
        return I.Datatype.equalsValue(this_[key], that_[key]);
      });
    },
    $update: function(table) {
      var this_ = this._;
      this.$type.enumerateDataDescriptors(function(descriptor, key) {
        if (!(key in table)) {
          table[key] = this_[key];
        }
      });
      return this.$type.createValue(this.$expr, table);
    }
  });
})