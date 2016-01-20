//@ I describe a standard object.
'Object'.subclass(function (I, We) {
  "use strict";
  I.know({
    //@ Class of this object.
    //@type {Std.Logic.Behavior} class or metaclass if this receiver is a class object
    $: null,
    //@ Table with package field substances.
    //@type {Rt.Table} table with package constants and subroutines
    $_: null,
    //@ Runtime system singleton.
    //@type {Rt.System} runtime system
    $rt: null,
    //@ Abort execution with a failure from this object.
    //@param ... {Any} failure reasons
    //@return never
    bad: function () {
      throw I._.Failure.create(this, I.slice(arguments));
    },
    //@ Build this new object from construction arguments.
    //@param ... {Any} construction arguments
    //@return nothing
    build: I.doNothing,
    //@ Unveil this new object after construction to complete initialization.
    //@return nothing
    unveil: I.doNothing
  });
  We.know({
    unveil: function () {
      We.$super.unveil.call(this);
      // every class installs $ and $_ constants for its own instances
      this.lockInstanceConstants({ $: this, $_: this._ });
    },
    createConstructor: function () {
      // constructor initializes new instances of this concrete class
      return function BaseObject(constructionArgs) {
        I.prepareNew(this);
        I.initializeNew(this, constructionArgs);
      };
    },
    downcast: function (object) {
      // every object knows its concrete class
      return object.$;
    }
  });
  I.share({
    //@ An abstract method burdens a subclass with the implementation.
    //@return never
    burdenSubclass: function () {
      this.bad('abstraction');
    },
    //@ Invoke build and unveil methods to initialize new object.
    //@param object {Std.BaseObject} new object
    //@param constantArgs {[Any]} construction arguments
    //@return nothing
    initializeNew: function (object, constructionArgs) {
      object.build.apply(object, constructionArgs);
      object.unveil();
    },
    //@ Copy uninitialized instance variables to new object.
    //@param object {Std.BaseObject} new object
    //@return nothing
    prepareNew: function (object) {
      for (var key in object) {
        // this is either a no-op or it copies default value of instance variable from prototype
        object[key] = object[key];
      }
      // seal new object after ownership of instance variables has been established
      Object.seal(object);
    },
    //@ A method should never be invoked.
    //@return never
    shouldNotOccur: function () {
      this.bad('state');
    }
  });
})