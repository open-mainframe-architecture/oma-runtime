//@ A FIFO buffer is a stream that buffers written items until the capacity is exhausted.
'BaseObject+Stream'.subclass(I => {
  "use strict";
  const Semaphore = I._.Wait._.Semaphore;
  I.am({
    Abstract: false
  });
  I.have({
    //@{Std.Wait.Semaphore} synchronize pipe writers on buffer capacity
    writeProtection: null,
    //@{[any]} buffered items that must still be read
    bufferedItems: null,
    //@{Std.Wait.Semaphore} synchronize pipe readers on item availability
    readProtection: null
  });
  I.know({
    //@param capacity {integer} maximum number of buffered items
    build: function(capacity) {
      I.$super.build.call(this);
      this.writeProtection = Semaphore.create(capacity || 1);
    },
    unveil: function() {
      I.$super.unveil.call(this);
      this.bufferedItems = [];
      this.readProtection = Semaphore.create(0);
    }
  });
  I.play({
    read: function() {
      // wait for at least one item in buffer
      return this.readProtection.decrement().triggers(() => {
        // there's now room to write one more item
        this.writeProtection.increment();
        // remove read item from buffer
        return this.bufferedItems.shift();
      });
    },
    write: function(it) {
      // wait for available capacity to write an item in buffer
      return this.writeProtection.decrement().triggers(() => {
        // there's now room to read one more item
        this.readProtection.increment();
        // add written item to buffer
        this.bufferedItems.push(it);
      });
    }
  });
})