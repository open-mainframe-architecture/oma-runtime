//@ A record value maps strings to field values.
'AbstractValue'.subclass(I => {
  "use strict";
  const Difference = I._.Difference;
  I.know({
    $difference: function(that) {
      const this_ = this._, that_ = that._, substitutions_ = I.createTable();
      this.$type.enumerateDescriptors((descriptor, key) => {
        if (descriptor.isDataDescriptor()) {
          const difference = I.compareValues(this_[key], that_[key]);
          if (!difference.isZero()) {
            substitutions_[key] = difference.compact();
          }
        }
        const metaKey = `@${key}`, metaDifference = I.compareValues(this[metaKey], that[metaKey]);
        if (!metaDifference.isZero()) {
          substitutions_[metaKey] = metaDifference.compact();
        }
      });
      return I.hasEnumerables(substitutions_) ? Difference.create(substitutions_) :
        Difference._.Zero;
    },
    $each: function(visit) {
      const this_ = this._;
      return this.$type.enumerateDescriptors((descriptor, key) =>
        !descriptor.isDataDescriptor() || visit(this_[key], key)
      );
    },
    $equals: function(that) {
      const this_ = this._, that_ = that._;
      return this.$type.enumerateDescriptors((descriptor, key) => {
        const metaKey = `@${key}`;
        return (!descriptor.isDataDescriptor() || I.equalValues(this_[key], that_[key])) &&
          I.equalValues(this[metaKey], that[metaKey]);
      });
    },
    $update: function(values_) {
      const this_ = this._, fields_ = I.createTable();
      this.$type.enumerateDescriptors((descriptor, key) => {
        if (descriptor.isDataDescriptor()) {
          fields_[key] = I.isPropertyOwner(values_, key) ? values_[key] : this_[key];
        }
        const metaKey = `@${key}`;
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