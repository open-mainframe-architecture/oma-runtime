'BaseObject+Eventful'.subclass(function (I) {
  "use strict";
  // I describe counting semaphores.
  I.am({
    Abstract: false
  });
  I.have({
    // current count of this Dijkstra semaphore
    semaphoreCount: null
  });
  I.know({
    build: function (count) {
      I.$super.build.call(this);
      this.semaphoreCount = count || 0;
    },
    // try to decrement
    testIgnition: function () {
      if (this.semaphoreCount) {
        // no need to wait, decrement this semaphore right away
        --this.semaphoreCount;
        return true;
      }
      return false;
    },
    // decrement event fires upon charging or after this semaphore has been incremented
    decrement: function () {
      return this.createEvent();
    },
    // fire oldest decrement event or just increment count
    increment: function () {
      var event = this.getFirstCharge();
      if (event) {
        event.fire();
      } else {
        ++this.semaphoreCount;
      }
    }
  });
})