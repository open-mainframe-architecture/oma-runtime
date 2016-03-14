//@ I describe a standard object.
'Object'.subclass(function(I, We) {
  "use strict";
  I.know({
    //@{Std.Logic.Behavior} class of this object or metaclass if this object is a class
    $: null,
    //@{Std.Table} table with package field substances
    $_: null,
    //@{Std.Runtime.System} runtime system singleton
    $rt: null,
    //@ Abort execution with a failure from this object.
    //@param ... {any} failure reasons are concatenated
    //@return never
    bad: function() {
      throw I._.Failure.create(this, Array.prototype.join.call(arguments, ' '));
    },
    //@ Build this new object from construction arguments.
    //@param ... {any} construction arguments
    //@return nothing
    build: I.doNothing,
    //@ Unveil this new object after construction to complete initialization.
    //@return nothing
    unveil: I.doNothing
  });
  We.know({
    unveil: function() {
      We.$super.unveil.call(this);
      // every class installs $ and $_ constants for its own instances
      this.lockInstanceConstants({ $: this, $_: this._ });
    },
    createConstructor: function() {
      // constructor initializes new instances of this concrete class
      return function BaseObject(constructionArgs) {
        I.prepareNew(this);
        I.initializeNew(this, constructionArgs);
      };
    },
    downcast: function(object) {
      // every object knows its concrete class
      return object.$;
    }
  });
  I.share({
    //@{Std.Closure} an abstract method burdens a subclass with the implementation
    burdenSubclass: function() {
      this.bad();
    },
    //@ Invoke build and unveil methods to initialize new object.
    //@param object {Std.BaseObject} new object
    //@param constantArgs {[Any]} construction arguments
    //@return nothing
    initializeNew: function(object, constructionArgs) {
      object.build.apply(object, constructionArgs);
      object.unveil();
    },
    //@ Copy uninitialized instance variables to new object.
    //@param object {Std.BaseObject} new object
    //@return nothing
    prepareNew: function(object) {
      for (var key in object) {
        // this is either a no-op or it copies default value of instance variable from prototype
        object[key] = object[key];
      }
      // seal new object after ownership of instance variables has been established
      Object.seal(object);
    },
    //@{Std.Closure} this method should never be invoked
    shouldNotOccur: function() {
      this.bad();
    }
  });
})