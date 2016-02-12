function refine(I) {
  "use strict";
  I.know({
    //@ Is this an empty container?
    //@return {boolean} true if this container does not hold elements, otherwise false
    isEmpty: function () {
      return this.size() === 0;
    },
    //@ Replace indexed element in this container. This may be destructive.
    //@param it {Any} new element to store at index
    //@param ix {Any} index of element to replace with new element
    //@return {Std.Container} this or new container
    //@except when this container does not store an element at index
    replace: function (it, ix) {
      return this.containsIndex(ix) ? this.store(it, ix) : this.bad(ix);
    },
    //@ Create iterator that walks over indexed elements of this container.
    //@return {Std.Iterator} iterator over elements
    walk: function () {
      return I.Loop.collect(this.walkIndices(), this.lookup.bind(this));
    },
    //@ Create iterator that walks over indices of this container.
    //@return {Std.Iterator} iterator over indices
    walkIndices: function () {
      return I.FailFastIterator.create(this.walkUnsafe(), this);
    },
    //@ Create iterator over indices, but ignore concurrent modifications of this container.
    //@return {Std.Iterator} iterator over indices
    walkUnsafe: I.burdenSubclass
  });
  I.nest({
    //@ A fail-fast iterator fails when the iterated container has been modified.
    FailFastIterator: 'Iterator._.Verifier'.subclass(function (I) {
      I.have({
        //@{Std.Container} iterated container
        container: null,
        //@{integer} modification count of container when this iterator was created
        revision: null
      });
      I.know({
        //@param decoratee {Std.Iterator} unsafe iterator over indices or elements
        //@param container {Std.Container} iterated container
        build: function (decoratee, container) {
          I.$super.build.call(this, decoratee);
          this.container = container;
          this.revision = container.modificationCount;
        },
        //@ Verify the iterated container has not been modified.
        //@except when the container is concurrently modified
        verifyCondition: function () {
          if (this.revision !== this.container.modificationCount) {
            this.bad('modification');
          }
        }
      });
    })
  });
}