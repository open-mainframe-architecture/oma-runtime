'BaseObject+Stream'.subclass(function(I) {
  "use strict";
  // I describe streams that queue written items until the capacity has been exhausted.
  I.am({
    Abstract: false
  });
  I.have({
    writtenItems: null,
    readProtection: null,
    writeProtection: null
  });
  I.know({
    build: function(capacity) {
      I.$super.build.call(this);
      this.writtenItems = [];
      this.readProtection = I._.Wait._.Semaphore.create(0);
      this.writeProtection = I._.Wait._.Semaphore.create(capacity || 1);
    }
  });
  I.peek({
    isReadable: I.returnTrue,
    isWritable: I.returnTrue
  });
  I.play({
    read: function() {
      var items = this.writtenItems, writeProtection = this.writeProtection;
      return this.readProtection.decrements().yields(function() {
        writeProtection.increment();
        return items.shift();
      });
    },
    write: function(it) {
      var items = this.writtenItems, readProtection = this.readProtection;
      return this.writeProtection.decrements().yields(function() {
        readProtection.increment();
        items.push(it);
      });
    }
  });
})