//@ A behavior describes how instances behave.
'Logic.Context'.subclass(I => {
  "use strict";
  I.have({
    //@{object} prototypical instance of this behavior
    instancePrototype: null,
    //@{function?} constructor for new instances of this concrete behavior
    instanceConstructor: null,
    //@{Std.Logic.Behavior} parent of this behavior in the inheritance hierarchy
    parentBehavior: null,
    //@{[Std.Logic.Behavior]} children of this behavior
    childBehaviors: null,
    //@{Std.Table} boolean flags of this behavior
    behaviorFlags: null,
    //@{Std.Logic.ClassPackage|Std.Logic.MetaclassPackage} field constants or package fields
    behaviorPackage: null,
    //@{Std.Table} expose table of behavior package for easy access
    _: null
  });
  const isPrototypeOf = Object.prototype.isPrototypeOf;
  I.know({
    //@param container {Std.Logic.MetaclassPackage|Std.Logic.Namespace} context of new behavior
    //@param key {string} unique key of behavior in container
    //@param module {Std.Logic.Module} defining module
    build: function(container, key, module) {
      I.$super.build.call(this, container, key, module);
      // most instance variables have already been initialized in addNewChildBehavior
      this.behaviorPackage = this.getPackageClass().create(this, '_');
      this._ = this.behaviorPackage._;
    },
    unveil: function() {
      // copy uninitialized instance variables before sealing this behavior
      for (let iv in this) {
        this[iv] = this[iv];
      }
      Object.seal(this);
      I.$super.unveil.call(this);
      if (!this.behaviorFlags.Abstract && !this.instanceConstructor) {
        // concrete behaviors have instance constructors
        this.instanceConstructor = this.createConstructor();
        this.instanceConstructor.prototype = this.instancePrototype;
      }
    },
    //@ Select behavior package or meta behavior from this behavior context.
    //@param key {string} logic key
    //@return {Std.Logic.Object?} selected logic object or nothing
    select: function(key) {
      switch (key) {
        case '_': return this.behaviorPackage;
        case '$': return this.$;
      }
    },
    //@ Add new instance accessors to this behavior.
    //@param accessors {object|Std.Table} accessor specifications
    //@return nothing
    addInstanceAccessors: function(accessors) {
      const prototype = this.instancePrototype;
      const descriptor = { configurable: true, enumerable: false };
      for (let key in accessors) {
        const accessor = accessors[key];
        descriptor.get = I.isClosure(accessor) ? accessor : accessor.get;
        descriptor.set = accessor.set;
        Reflect.defineProperty(prototype, key, descriptor);
      }
    },
    //@ Add new instance methods and constants to this behavior.
    //@param knowledge {object|Std.Table} instance method and constant specifications
    //@return nothing
    addInstanceKnowledge: function(knowledge) {
      const prototype = this.instancePrototype;
      const descriptor = { configurable: true, enumerable: false, writable: false };
      for (let key in knowledge) {
        descriptor.value = knowledge[key];
        Reflect.defineProperty(prototype, key, descriptor);
      }
      Object.getOwnPropertySymbols(knowledge).forEach(symbol => {
        descriptor.value = knowledge[symbol];
        Reflect.defineProperty(prototype, symbol, descriptor);
      });
    },
    //@ Add new instance variables to this behavior.
    //@param variables {object|Std.Table} instance variable specifications
    //@return nothing
    addInstanceVariables: function(variables) {
      const prototype = this.instancePrototype;
      const descriptor = { configurable: false, enumerable: true, writable: true };
      for (let key in variables) {
        descriptor.value = variables[key];
        Reflect.defineProperty(prototype, key, descriptor);
      }
    },
    //@ Add new child behavior that inherits from this behavior.
    //@param behaviorClass {Std.Logic.Behavior} behavior class instantiates new child behavior
    //@param constructor {function?} existing constructor of new child behavior or nothing
    //@return {Std.Logic.Behavior} new child behavior
    addNewChildBehavior: function(behaviorClass, constructor) {
      const childBehavior = Object.create(behaviorClass.instancePrototype);
      if (constructor) {
        childBehavior.instancePrototype = constructor.prototype;
        childBehavior.instanceConstructor = constructor;
      } else {
        childBehavior.instancePrototype = Object.create(this.instancePrototype);
      }
      childBehavior.parentBehavior = this;
      childBehavior.childBehaviors = [];
      childBehavior.behaviorFlags = I.createTable(this.behaviorFlags);
      this.childBehaviors.push(childBehavior);
      return childBehavior;
    },
    //@ Create instance of this concrete behavior.
    //@param ... {*} construction arguments
    //@return {object} new instance of this behavior
    create: function() {
      return Reflect.construct(this.instanceConstructor, arguments);
    },
    //@ Create instance constructor of this concrete behavior.
    //@return {function} new constructor
    createConstructor: I.shouldNotOccur,
    //@ Test whether it is an instance of this behavior.
    //@param it {*} instance to test
    //@return {boolean} true if it is an instance, otherwise false
    describes: function(it) {
      const prototype = this.instancePrototype;
      return !prototype || isPrototypeOf.call(prototype, it);
    },
    //@ Get distance from this behavior to the root behavior.
    //@return {integer} number of super behavior to reach root behavior
    getInheritanceDepth: function() {
      for (let behavior = this, depth = 0; ; ++depth) {
        const parentBehavior = behavior.parentBehavior;
        if (parentBehavior === behavior) {
          return depth;
        }
        behavior = parentBehavior;
      }
    },
    //@ Get package this behavior owns.
    //@return {Std.Logic.ClassPackage|Std.Logic.MetaclassPackage} class or metaclass package
    getPackage: function() {
      return this.behaviorPackage;
    },
    //@ Get class that creates behavior package of this behavior.
    //@return {Std.Logic.Object.$} class for logic package
    getPackageClass: I.burdenSubclass,
    //@ Get parent from which this behavior inherits.
    //@return {Std.Logic.Behavior} parent behavior
    getParentBehavior: function() {
      return this.parentBehavior;
    },
    //@ Get instance prototype of this behavior.
    //@return {*} prototype
    getPrototype: function() {
      return this.instancePrototype;
    },
    //@ Test whether this behavior cannot create instances.
    //@return {boolean} true if this behavior cannot create instances, otherwise false
    isAbstract: function() {
      return this.behaviorFlags.Abstract;
    },
    //@ Test whether this behavior cannot create children.
    //@return {boolean} true if this behavior can not have child behaviors, otherwise false
    isFinal: function() {
      return this.behaviorFlags.Final;
    },
    //@ Test whether this is the root behavior that inherits from itself.
    //@return {boolean} true if this behavior is its own parent behavior, otherwise false
    isRootBehavior: function() {
      return this.parentBehavior === this;
    },
    //@ Assign values to instance constants.
    //@param constants {object|Std.Table} mapping from constant name to value
    //@return nothing
    lockInstanceConstants: function(constants) {
      const prototype = this.instancePrototype;
      for (let key in constants) {
        I.lockProperty(prototype, key, constants[key]);
      }
    },
    //@ Refine instance methods with new implementations.
    //@param methods {object|Std.Table} mapping from method name to refined code
    //@param formers {object|Std.Table} accumulator for old code of refined methods
    //@return nothing
    refineInstanceMethods: function(methods, formers) {
      const prototype = this.instancePrototype;
      const descriptor = { configurable: true, enumerable: false, writable: false };
      for (let key in methods) {
        formers[key] = prototype[key];
        descriptor.value = methods[key];
        Reflect.defineProperty(prototype, key, descriptor);
      }
      Object.getOwnPropertySymbols(methods).forEach(symbol => {
        formers[symbol] = prototype[symbol];
        descriptor.value = methods[symbol];
        Reflect.defineProperty(prototype, symbol, descriptor);
      });
    },
    //@ Assign behavior flags.
    //@param flags {object|Std.Table} flag values
    //@return nothing
    setBehaviorFlags: function(flags) {
      const behaviorFlags = this.behaviorFlags;
      for (let key in flags) {
        I.lockProperty(behaviorFlags, key, !!flags[key]);
      }
    }
  });
})