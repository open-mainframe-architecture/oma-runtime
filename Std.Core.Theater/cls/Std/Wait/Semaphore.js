//@ A Dijkstra semaphore.
'Object'.subclass(I => {
  "use strict";
  I.have({
    //@{integer} current count of this Dijkstra semaphore
    semaphoreCount: null,
    //@{Std.Event.$._.CommonStrategy} FCFS strategy for charged events
    semaphoreStrategy: null
  });
  I.know({
    //@param count {integer?} initial, nonnegative semaphore count (default is 0)
    build: function(count) {
      I.$super.build.call(this);
      this.semaphoreCount = count || 0;
    },
    unveil: function() {
      I.$super.unveil.call(this);
      this.semaphoreStrategy = I.When.CommonStrategy.create(false, () => {
        if (this.semaphoreCount) {
          // no need to wait, decrement this semaphore right away
          --this.semaphoreCount;
          return true;
        }
        return false;
      });
    },
    //@ Create decrement event that fires upon charging or after semaphore has been incremented.
    //@return {Std.Event} decrement event
    decrement: function() {
      return this.semaphoreStrategy.createEvent();
    },
    //@ Fire oldest decrement event or just increment semaphore count.
    //@return nothing
    increment: function() {
      if (!this.semaphoreStrategy.fireOldest()) {
        ++this.semaphoreCount;
      }
    }
  });
})