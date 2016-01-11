'Role'.subclass(['Std.Core.Theater'], function (I) {
  "use strict";
  // I describe an asynchronous stream with read and/or write operations.
  I.peek({
    isReadable: I.returnFalse,
    isWritable: I.returnFalse
  });
  I.play({
    // read item from this readable stream
    read: I.shouldNotOccur,
    // write item to this writable stream
    write: I.shouldNotOccur
  });
})