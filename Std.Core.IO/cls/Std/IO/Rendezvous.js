//@ A rendez-vous stream synchronizes the reader and writer.
'BaseObject+Stream'.subclass(I => {
  "use strict";
  const Semaphore = I._.Wait._.Semaphore;
  I.am({
    Abstract: false
  });
  I.have({
    //@{any} last item written
    writtenItem: null,
    //@{Std.Wait.Semaphore} binary semaphore for reader
    readProtection: null,
    //@{Std.Wait.Semaphore} binary semaphore for writer
    writeProtection: null
  });
  I.know({
    unveil: function() {
      I.$super.unveil.call(this);
      // binary semaphores to synchronize one reader and one writer
      this.readProtection = Semaphore.create(0);
      this.writeProtection = Semaphore.create(0);
    }
  });
  I.play({
    read: function() {
      // announce arrival of this read job
      this.writeProtection.increment();
      // wait for write job to complete
      return this.readProtection.decrement().triggers(() => this.writtenItem);
    },
    write: function(it) {
      // wait for read job to arrive
      return this.writeProtection.decrement().triggers(() => {
        // complete this write job
        this.readProtection.increment();
        this.writtenItem = it;
      });
    }
  });
})