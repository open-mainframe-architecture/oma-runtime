//@ A record value maps strings to field values.
'AbstractValue'.subclass(function(I) {
  "use strict";
  I.know({
    $difference: function(that) {
      var this_ = this._, that_ = that._, substitutions_ = I.createTable();
      this.$type.enumerateDescriptors(function(descriptor, key) {
        if (descriptor.isDataDescriptor()) {
          var difference = I.compareValues(this_[key], that_[key]);
          if (!difference.isZero()) {
            substitutions_[key] = difference.compact();
          }
        }
        var metaKey = '@' + key, metaDifference = I.compareValues(this[metaKey], that[metaKey]);
        if (!metaDifference.isZero()) {
          substitutions_[metaKey] = metaDifference.compact();
        }
      }.bind(this));
      return I.hasEnumerables(substitutions_) ? I._.Difference.create(substitutions_) :
        I._.Difference._.Zero;
    },
    $each: function(visit) {
      var this_ = this._;
      return this.$type.enumerateDescriptors(function(descriptor, key) {
        return !descriptor.isDataDescriptor() || visit(this_[key], key);
      });
    },
    $equals: function(that) {
      var this_ = this._, that_ = that._;
      return this.$type.enumerateDescriptors(function(descriptor, key) {
        var metaKey = '@' + key;
        return (!descriptor.isDataDescriptor() || I.equalValues(this_[key], that_[key])) &&
          I.equalValues(this[metaKey], that[metaKey]);
      }.bind(this));
    },
    $update: function(values_) {
      var this_ = this._, fields_ = I.createTable();
      this.$type.enumerateDescriptors(function(descriptor, key) {
        if (descriptor.isDataDescriptor()) {
          fields_[key] = I.isPropertyOwner(values_, key) ? values_[key] : this_[key];
        }
        var metaKey = '@' + key;
        if (I.isPropertyOwner(values_, metaKey)) {
          if (!I.equalValues(values_[metaKey], descriptor.getAnnotations())) {
            fields_[metaKey] = values_[metaKey];
          }
        } else if (I.isPropertyOwner(this_, metaKey)) {
          fields_[metaKey] = this_[metaKey];
        }
      });
      return this.$type.createValue(this.$expr, fields_);
    }
  });
})