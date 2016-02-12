//@ A record value maps strings to field values.
'AbstractValue'.subclass(function (I) {
  "use strict";
  I.know({
    $difference: function (that) {
      var this_ = this._, that_ = that._, mutations_ = I.createTable();
      this.$type.enumerateDataDescriptors(function (descriptor, key) {
        var difference = I.compareValues(this_[key], that_[key]);
        if (!difference.isZero()) {
          mutations_[key] = difference.compact();
        }
      });
      return I.hasEnumerables(mutations_) ? I._.Difference.create(mutations_) :
        I._.Difference._.Zero;
    },
    $each: function (visit) {
      var this_ = this._;
      return this.$type.enumerateDataDescriptors(function (descriptor, key) {
        return visit(this_[key], key);
      });
    },
    $equals: function (that) {
      var this_ = this._, that_ = that._;
      return this.$type.enumerateDataDescriptors(function (descriptor, key) {
        return I.equalsValue(this_[key], that_[key]);
      });
    },
    $update: function (values_) {
      var this_ = this._, fields_ = I.createTable();
      this.$type.enumerateDataDescriptors(function (descriptor, key) {
        fields_[key] = I.isPropertyOwner(values_, key) ? values_[key] : this_[key];
      });
      return this.$type.createValue(this.$expr, fields_);
    }
  });
})