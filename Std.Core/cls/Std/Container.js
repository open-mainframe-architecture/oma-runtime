function refine(I) {
  "use strict";
  I.know({
    isEmpty: function() {
      return this.size() === 0;
    },
    // replace indexed element at ix with it
    replace: function(it, ix) {
      return this.containsIndex(ix) ? this.store(it, ix) : this.bad(ix);
    },
    // create iterator that walks over contained elements
    walk: function() {
      return I.Loop.collect(this.walkIndices(), this.lookup.bind(this));
    },
    // create iterator that walks over indices of contained elements
    walkIndices: function() {
      return I.FailFastIterator.create(this.walkUnsafe(), this); 
    },
    // create iterator that walks over indices, ignoring concurrent modifications
    walkUnsafe: I.burdenSubclass
  });
  I.nest({
    FailFastIterator: 'Iterator._.Verifier'.subclass(function(I) {
      // I describe an iterator that fails when the iterated container has been modified.
      I.have({
        // iterated container
        container: null,
        // modification count of container when this iterator was created
        revision: null
      });
      I.know({
        build: function(decoratee, container) {
          I.$super.build.call(this, decoratee);
          this.container = container;
          this.revision = container.modificationCount;
        },
        verifyCondition: function() {
          if (this.revision !== this.container.modificationCount) {
            this.bad('modification');
          }
        }
      });
    })
  });
}