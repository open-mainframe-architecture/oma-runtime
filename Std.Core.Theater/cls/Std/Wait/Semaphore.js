//@ A Dijkstra semaphore that counts.
'BaseObject+Eventful'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{integer} current count of this Dijkstra semaphore
    semaphoreCount: null
  });
  I.know({
    //@param count {number} initial, nonnegative semaphore count
    build: function(count) {
      I.$super.build.call(this);
      this.semaphoreCount = Math.floor(count || 0);
    },
    testIgnition: function() {
      if (this.semaphoreCount) {
        // no need to wait, decrement this semaphore right away
        --this.semaphoreCount;
        return true;
      }
      return false;
    },
    //@ Create decrement event that fires upon charging or after semaphore has been incremented.
    //@return {Std.FullEvent} decrement event
    decrement: function() {
      return this.createEvent();
    },
    //@ Fire oldest decrement event or just increment semaphore count.
    //@return nothing
    increment: function() {
      var event = this.getFirstCharge();
      if (event) {
        event.fire();
      } else {
        ++this.semaphoreCount;
      }
    }
  });
})