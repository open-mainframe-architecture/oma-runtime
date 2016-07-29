//@ A standard object lives in a runtime system.
'Void'.subclass((I, We) => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    //@{Std.Logic.Behavior} class of this object or metaclass if this object is a class
    $: null,
    //@{Std.Table} table with package field constants
    $_: null,
    //@{Std.Runtime.System} runtime system singleton
    $rt: null,
    //@ Build this new object from construction arguments.
    //@param ... {*} construction arguments
    //@return nothing
    build: I.doNothing,
    //@ Unveil this new object after construction to complete initialization.
    //@return nothing
    unveil: I.doNothing
  });
  // hoist Object.seal, because Object is redefined in Object constructor
  const seal = Object.seal;
  We.know({
    unveil: function() {
      We.$super.unveil.call(this);
      // every class installs $ and $_ constants for its own instances
      this.lockInstanceConstants({ $: this, $_: this._ });
    },
    createConstructor: function() {
      // constructor initializes new instance of this concrete class
      return function Object() {
        // copy uninitialized instance variables from instance prototype
        for (let iv in this) {
          this[iv] = this[iv];
        }
        // seal new object after ownership of instance variables has been established
        seal(this);
        this.build(...arguments);
        this.unveil();
      };
    }
  });
})