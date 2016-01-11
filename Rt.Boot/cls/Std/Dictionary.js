'Container'.subclass(function (I) {
  "use strict";
  // I describe a dictionary that maps string indices to elements.
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
      var this_ = this._;
      return Object.getOwnPropertyNames(this_).some(function (ix) {
        return this_[ix] === it;
      });
    },
    containsIndex: function (ix) {
      return I.isPropertyOwner(this._, ix);
    },
    enumerate: function (visit) {
      var this_ = this._;
      return Object.getOwnPropertyNames(this_).every(function (ix) {
        return visit(this_[ix], ix) !== false;
      });
    },
    indexOf: function (it) {
      var this_ = this._;
      return Object.getOwnPropertyNames(this_).find(function (ix) {
        return this_[ix] === it;
      });
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
      var this_ = this._, indices = Object.getOwnPropertyNames(this_);
      if (indices.length) {
        ++this.modificationCount;
        indices.forEach(function (ix) {
          delete this_[ix];
        });
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