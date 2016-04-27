//@ An asynchronous stream supports read and/or write operations.
'Role'.subclass(['Std.Core.Theater'], I => {
  "use strict";
  I.play({
    //@ Read item from this readable stream.
    //@promise {any} item read from stream
    read: I.burdenSubclass,
    //@ Write item to this writable stream.
    //@param it {any} item to write
    //@promise nothing when item has been written
    write: I.burdenSubclass
  });
})