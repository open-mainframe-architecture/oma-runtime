'BaseObject+Indexable'.subclass(function (I) {
  "use strict";
  // I describe a container that stores, retrieves and removes indexed elements.
  I.have({
    // count is increased after every modification
    modificationCount: 0
  });
  I.know({
    // clearance of this container produces an empty container
    clear: I.burdenSubclass,
    // remove indexed elements from this container
    remove: I.burdenSubclass,
    // store indexed element in this container
    store: I.burdenSubclass
  });
})