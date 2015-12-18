'Object'.subclass(function (I, We) {
  "use strict";
  // I describe objects that enrich plain JavaScript objects.
  I.know({
    // class of this object
    $: null,
    // table with package field substances (foo.$_ is shortcut for foo.$._)
    $_: null,
    // runtime system singleton
    $rt: null,
    // abort execution with a failure
    bad: function () {
      throw I._.Failure.create(this, I.slice(arguments));
    },
    // build this new object from construction arguments
    build: I.doNothing,
    // unveil this new object after construction to complete initialization
    unveil: I.doNothing
  });
  We.know({
    unveil: function () {
      We.$super.unveil.call(this);
      // every class installs $ and $_ constants for its own instances
      this.lockInstanceConstants({ $: this, $_: this._ });
    },
    // create constructor that initializes new instances of this concrete class
    createConstructor: function () {
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
    // method closure for an abstract method
    burdenSubclass: function () {
      this.bad('abstraction');
    },
    // invoke build and unveil methods to initialize new object
    initializeNew: function (object, constructionArgs) {
      object.build.apply(object, constructionArgs);
      object.unveil();
    },
    // copy uninitialized instance variables to new object
    prepareNew: function (object) {
      for (var key in object) {
        // this is either a no-op or it copies default value of instance variable from prototype
        object[key] = object[key];
      }
      // seal new object after ownership of instance variables has been established
      Object.seal(object);
    },
    // method closure for situation that should not have occurred
    shouldNotOccur: function () {
      this.bad('state');
    }
  });
})