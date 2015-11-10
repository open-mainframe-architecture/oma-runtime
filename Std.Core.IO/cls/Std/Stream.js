'Role'.subclass(function(I) {
  "use strict";
  // I describe asynchronous streams with read and/or write operations.
  I.peek({
    isReadable: I.returnFalse,
    isWritable: I.returnFalse
  });
  I.play({
    // read item from this stream
    read: I.shouldNotOccur,
    // write item to this stream
    write: I.shouldNotOccur
  });
})