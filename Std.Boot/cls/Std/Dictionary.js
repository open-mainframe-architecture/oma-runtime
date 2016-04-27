//@ A dictionary maps string indices to contained elements.
'Container'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //{Std.Table} table with entries of this dictionary
    _: null,
    //{Std.Dictionary?} optional dictionary to find indices missing from this dictionary
    baseDictionary: null
  });
  I.know({
    //@param baseDictionary {Std.Dictionary?} base dictionary of this new dictionary
    build: function(baseDictionary) {
      I.$super.build.call(this);
      this.baseDictionary = baseDictionary;
    },
    unveil: function() {
      I.$super.unveil.call(this);
      if (!this._) {
        // extend table of base dictionary or create empty table
        this._ = this.baseDictionary ? Object.create(this.baseDictionary._) : I.createTable();
      }
    },
    contains: function(it) {
      return Object.getOwnPropertyNames(this._).some(ix => this._[ix] === it);
    },
    containsIndex: function(ix) {
      return I.isPropertyOwner(this._, ix);
    },
    enumerate: function(visit) {
      return Object.getOwnPropertyNames(this._).every(ix => visit(this._[ix], ix) !== false);
    },
    indexOf: function(it) {
      return Object.getOwnPropertyNames(this._).find(ix => this._[ix] === it);
    },
    find: function(ix) {
      // find indexed element in this dictionary or in some base dictionary
      return this._[ix];
    },
    lookup: function(ix) {
      // find in this dictionary, not in base
      if (I.isPropertyOwner(this._, ix)) {
        return this._[ix];
      }
    },
    size: function() {
      return Object.getOwnPropertyNames(this._).length;
    },
    clear: function() {
      const indices = Object.getOwnPropertyNames(this._);
      if (indices.length) {
        ++this.modificationCount;
        for (let ix of indices) {
          delete this._[ix];
        }
      }
      return this;
    },
    store: function(it, ix) {
      if (!I.isPropertyOwner(this._, ix) || this._[ix] !== it) {
        ++this.modificationCount;
        this._[ix] = it;
      }
      return this;
    },
    remove: function(ix) {
      if (I.isPropertyOwner(this._, ix)) {
        ++this.modificationCount;
        delete this._[ix];
      }
      return this;
    },
    //@ Store constant at index. The index cannot be removed, updated or cleared afterwards.
    //@param it {any} JavaScript object or value to store
    //@param ix {string} index of constant
    //@return {Std.Dictionary} this dictionary, because it's destructive
    storeConstant: function(it, ix) {
      ++this.modificationCount;
      Object.defineProperty(this._, ix, {
        value: it, configurable: false, enumerable: true, writable: false
      });
      return this;
    }
  });
})