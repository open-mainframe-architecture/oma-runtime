'Container'.subclass(function (I) {
  "use strict";
  // I describe dictionaries backed by a table.
  I.am({
    Abstract: false
  });
  I.have({
    // table that backs this dictionary
    _: null,
    // optional base dictionary where indices are found, which are missing from this dictionary
    baseDictionary: null
  });
  I.know({
    build: function (baseDictionary) {
      I.$super.build.call(this);
      this.baseDictionary = baseDictionary;
    },
    unveil: function () {
      I.$super.unveil.call(this);
      if (!this._) {
        // extend table of base dictionary or create empty table
        this._ = this.baseDictionary ? Object.create(this.baseDictionary._) : I.createTable();
      }
    },
    contains: function (it) {
      var this_ = this._, keys = Object.getOwnPropertyNames(this_);
      for (var i = 0, n = keys.length; i < n; ++i) {
        if (this_[keys[i]] === it) {
          return true;
        }
      }
      return false;
    },
    containsIndex: function (ix) {
      return I.isPropertyOwner(this._, ix);
    },
    enumerate: function (visit) {
      var this_ = this._, keys = Object.getOwnPropertyNames(this_);
      for (var i = 0, n = keys.length; i < n; ++i) {
        if (visit(this_[keys[i]], keys[i]) === false) {
          return false;
        }
      }
      return true;
    },
    indexOf: function (it) {
      var this_ = this._, keys = Object.getOwnPropertyNames(this_);
      for (var i = 0, n = keys.length; i < n; ++i) {
        if (this_[keys[i]] === it) {
          return keys[i];
        }
      }
    },
    find: function (ix) {
      // find indexed element in this dictionary or in some base dictionary
      return this._[ix];
    },
    lookup: function (ix) {
      // strict lookup in this dictionary
      if (I.isPropertyOwner(this._, ix)) {
        return this._[ix];
      }
    },
    size: function () {
      return Object.getOwnPropertyNames(this._).length;
    },
    clear: function () {
      var this_ = this._, keys = Object.getOwnPropertyNames(this_);
      if (keys.length) {
        ++this.modificationCount;
        for (var i = 0, n = keys.length; i < n; ++i) {
          delete this_[keys[i]];
        }
      }
      return this;
    },
    store: function (it, ix) {
      if (!I.isPropertyOwner(this._, ix) || this._[ix] !== it) {
        ++this.modificationCount;
        this._[ix] = it;
      }
      return this;
    },
    remove: function (ix) {
      if (I.isPropertyOwner(this._, ix)) {
        ++this.modificationCount;
        delete this._[ix];
      }
      return this;
    },
    storeConstant: function (it, ix) {
      var descriptor = { value: it, configurable: false, enumerable: true, writable: false };
      ++this.modificationCount;
      Object.defineProperty(this._, ix, descriptor);
      return this;
    }
  });
})