//@ A record value maps strings to field values.
'Value.Object'.subclass(I => {
  "use strict";
  I.access({
    $indices: function() {
      return Object.keys(this._)[Symbol.iterator]();
    }
  });
  const Difference = I._.Difference;
  I.know({
    $compare: function(that) {
      const type = this.$type, this_ = this._, that_ = that._, substitutions = I.createTable();
      for (let key of type.iterateDescriptorKeys()) {
        const descriptor = type.selectDescriptor(key);
        if (descriptor.isDataDescriptor()) {
          const difference = I.compareValues(this_[key], that_[key]);
          if (!difference.isZero()) {
            substitutions[key] = difference.compact();
          }
        }
        const metaKey = `@${key}`, metaDifference = I.Data.compare(this[metaKey], that[metaKey]);
        if (!metaDifference.isZero()) {
          substitutions[metaKey] = metaDifference.compact();
        }
      }
      return I.hasEnumerables(substitutions) ? Difference.create(substitutions) :
        Difference._.Zero;
    },
    $equals: function(that) {
      const type = this.$type, this_ = this._, that_ = that._;
      for (let key of type.iterateDescriptorKeys()) {
        const descriptor = type.selectDescriptor(key), metaKey = `@${key}`;
        if (descriptor.isDataDescriptor() && !I.Data.equals(this_[key], that_[key])) {
          return false;
        }
        if (!I.Data.equals(this[metaKey], that[metaKey])) {
          return false;
        }
      }
      return true;
    },
    $select: function(key) {
      return this._[key];
    },
    $update: function(values) {
      const type = this.$type, this_ = this._, fields = I.createTable();
      for (let key of type.iterateDescriptorKeys()) {
        const descriptor = type.selectDescriptor(key);
        if (descriptor.isDataDescriptor()) {
          fields[key] = I.isPropertyOwner(values, key) ? values[key] : this_[key];
        }
        const metaKey = `@${key}`;
        if (I.isPropertyOwner(values, metaKey)) {
          if (!I.Data.equals(values[metaKey], descriptor.getAnnotations())) {
            fields[metaKey] = values[metaKey];
          }
        } else if (I.isPropertyOwner(this_, metaKey)) {
          fields[metaKey] = this_[metaKey];
        }
      }
      return this.$type.createValue(this.$expr, fields);
    }
  });
})