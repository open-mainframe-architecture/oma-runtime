'BaseObject+Stream'.subclass(function (I) {
  "use strict";
  // I describe a stream that buffers written items until the capacity has been exhausted.
  I.am({
    Abstract: false
  });
  I.have({
    bufferedItems: null,
    readProtection: null,
    writeProtection: null
  });
  I.know({
    build: function (capacity) {
      I.$super.build.call(this);
      this.bufferedItems = [];
      this.readProtection = I._.Wait._.Semaphore.create(0);
      this.writeProtection = I._.Wait._.Semaphore.create(capacity || 1);
    }
  });
  I.peek({
    isReadable: I.returnTrue,
    isWritable: I.returnTrue
  });
  I.play({
    read: function () {
      var items = this.bufferedItems, writeProtection = this.writeProtection;
      return this.readProtection.decrement().triggers(function () {
        writeProtection.increment();
        return items.shift();
      });
    },
    write: function (it) {
      var items = this.bufferedItems, readProtection = this.readProtection;
      return this.writeProtection.decrement().triggers(function () {
        readProtection.increment();
        items.push(it);
      });
    }
  });
})