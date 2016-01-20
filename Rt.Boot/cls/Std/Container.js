//@ I describe a container that stores, retrieves and removes indexed elements.
'BaseObject+Indexable'.subclass(function (I) {
  "use strict";
  I.have({
    //@{integer} Modification count is increased after every modification.
    modificationCount: 0
  });
  I.know({
    //@ Clearance produces an empty container. This may be destructive.
    //@return {Std.Container} new container or this receiver if destructive
    clear: I.burdenSubclass,
    //@ Remove indexed element from this container. This may be destructive.
    //@param ix {Any} index of element to remove
    //@return {Std.Container} new container or this receiver if destructive
    remove: I.burdenSubclass,
    //@ Store indexed element in this container. This may be destructive.
    //@param it {Any} element to store
    //@param ix {Any} index where to store
    //@return {Std.Container} new container or this receiver if destructive
    store: I.burdenSubclass
  });
})