'BaseObject+Stream'.subclass(function (I) {
  "use strict";
  // I describe a stream that synchronizes the reader and writer.
  I.am({
    Abstract: false
  });
  I.have({
    writtenItem: null,
    readProtection: null,
    writeProtection: null
  });
  I.know({
    unveil: function () {
      I.$super.unveil.call(this);
      // binary semaphores to synchronize one reader and one writer
      this.readProtection = I._.Wait._.Semaphore.create(0);
      this.writeProtection = I._.Wait._.Semaphore.create(0);
    }
  });
  I.peek({
    isReadable: I.returnTrue,
    isWritable: I.returnTrue
  });
  I.play({
    read: function () {
      var self = this;
      // announce arrival of this read job
      this.writeProtection.increment();
      // wait for write job to complete
      return this.readProtection.decrement().triggers(function () {
        return self.writtenItem;
      });
    },
    write: function (it) {
      var self = this, readProtection = this.readProtection;
      // wait for read job to arrive
      return this.writeProtection.decrement().triggers(function () {
        // complete this write job
        readProtection.increment();
        self.writtenItem = it;
      });
    }
  });
})