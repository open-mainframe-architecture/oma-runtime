//@ A FIFO buffer is a stream that buffers written items until the capacity is exhausted.
'BaseObject+Stream'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{[any]} buffered items that must still be read
    bufferedItems: null,
    //@{Std.Wait.Semaphore} synchronize pipe readers on item availability
    readProtection: null,
    //@{Std.Wait.Semaphore} synchronize pipe writers on buffer capacity
    writeProtection: null
  });
  I.know({
    //@param capacity {integer} maximum number of buffered items
    build: function(capacity) {
      I.$super.build.call(this);
      this.bufferedItems = [];
      this.readProtection = I._.Wait._.Semaphore.create(0);
      this.writeProtection = I._.Wait._.Semaphore.create(capacity || 1);
    }
  });
  I.play({
    read: function() {
      // wait for at least one item in buffer
      return this.readProtection.decrement().triggers(function() {
        // there's now room to write one more item
        this.writeProtection.increment();
        // remove read item from buffer
        return this.bufferedItems.shift();
      });
    },
    write: function(it) {
      // wait for available capacity to write an item in buffer
      return this.writeProtection.decrement().triggers(function() {
        // there's now room to read one more item
        this.readProtection.increment();
        // add written item to buffer
        this.bufferedItems.push(it);
      });
    }
  });
})