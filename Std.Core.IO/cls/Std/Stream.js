//@ An asynchronous stream supports read and/or write operations.
'Role'.subclass(['Std.Core.Theater'], function (I) {
  "use strict";
  I.peek({
    //@ Can item be read from this stream?
    //@return {boolean} true if this stream is readable, otherwise false
    isReadable: I.returnFalse,
    //@ Can item be written to this stream?
    //@return {boolean} true if this stream is writable, otherwise false
    isWritable: I.returnFalse
  });
  I.play({
    //@ Read item from this readable stream.
    //@promise {any} item read from stream
    read: I.shouldNotOccur,
    //@ Write item to this writable stream.
    //@param it {any} item to write
    //@promise nothing when item has been written
    write: I.shouldNotOccur
  });
})