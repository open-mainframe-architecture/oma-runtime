//@ A behavior describes how instances behave.
'BaseObject+Logical+Context'.subclass(I => {
  "use strict";
  const Field = I._.Field, InstanceFields = I._.InstanceFields;
  I.have({
    //@{Any} prototypical instance of this behavior
    instancePrototype: null,
    //@{Std.Closure?} legacy or computed constructor for new instances
    instanceConstructor: null,
    //@{integer} distance from this behavior to the root in the inheritance hierarchy
    inheritanceDepth: 0,
    //@{Std.Logic.Behavior} parent of this behavior in the inheritance hierarchy
    parentBehavior: null,
    //@{[Std.Logic.Behavior]} children of this behavior
    childBehaviors: null,
    //@{Std.Logic.Behavior?} definitions of trait behavior have been copied into this behavior
    traitBehavior: null,
    //@{Std.Table} boolean flags of this behavior
    behaviorFlags_: null,
    //@{Std.Logic.InstanceFields} container for instance fields of this behavior
    instanceFields: null,
    //@{Std.Logic.ClassPackage|Std.Logic.MetaclassPackage} field substances or package fields
    behaviorPackage: null,
    //@{Std.Table} expose table of behavior package for easy access
    _: null
  });
  I.know({
    unveil: function() {
      // preparation of basic behavior object copies uninitialized variables and seals it
      I.prepareNew(this);
      I.$super.unveil.call(this);
      if (!this.behaviorFlags_.Abstract && !this.instanceConstructor) {
        // concrete behaviors have instance constructors
        this.instanceConstructor = this.createConstructor();
        this.instanceConstructor.prototype = this.instancePrototype;
      }
    },
    buildLogical: function(context, key, module) {
      I.$super.buildLogical.call(this, context, key, module);
      const parent = this.parentBehavior;
      // instance fields and behavior package belong to same module as this behavior 
      this.instanceFields = InstanceFields.create(parent.instanceFields, this, module);
      this.behaviorPackage = this.$_.BehaviorPackage.create(parent.behaviorPackage, this, module);
      this._ = this.behaviorPackage._;
    },
    //@ Enumerate behavior package, meta behavior and instance fields of this behavior.
    enumerate: function(visit) {
      return visit(this.behaviorPackage, '_') !== false &&
        visit(this.$, '$') !== false &&
        visit(this.instanceFields, '#') !== false;
    },
    //@ Look up behavior package, meta behavior or instance fields of this behavior.
    //@param ix {string} _ for package, $ for meta behavior and # for instance fields
    //@return {Std.Logical?} logical object or nothing
    lookup: function(ix) {
      switch (ix) {
        case '_': return this.behaviorPackage;
        case '$': return this.$;
        case '#': return this.instanceFields;
      }
    },
    //@ Add new instance getters and setters to this behavior.
    //@param module {Std.Logic.Module} module that defines accessors
    //@param accessors_ {Std.Table} accessor specifications
    //@return nothing
    addInstanceAccessors: function(module, accessors_) {
      const fields = this.instanceFields, descriptor = { configurable: true, enumerable: false };
      for (let key in accessors_) {
        const it = accessors_[key];
        // field substance is JavaScript object with get and set closure
        const substance = { get: I.isClosure(it) ? it : it.get, set: it.set };
        fields.store(Field.create(fields, key, module, substance, false), key);
        descriptor.get = substance.get;
        descriptor.set = substance.set;
        Object.defineProperty(this.instancePrototype, key, descriptor);
      }
    },
    //@ Add new instance methods and constants to this behavior.
    //@param module {Std.Logic.Module} module that defines instance fields
    //@param fields_ {Std.Table} field specifications
    //@return nothing
    //@except when specified value is neither null (constant) nor a closure (method)
    addInstanceKnowledge: function(module, fields_) {
      const fields = this.instanceFields;
      const descriptor = { configurable: true, enumerable: false, writable: false };
      for (let key in fields_) {
        const substance = fields_[key];
        this.assert(substance === null || I.isClosure(substance));
        fields.store(Field.create(fields, key, module, substance, false), key);
        descriptor.value = substance;
        Object.defineProperty(this.instancePrototype, key, descriptor);
      }
    },
    //@ Add new instance variables to this behavior.
    //@param module {Std.Logic.Module} module that defines instance variables
    //@param vars_ {Std.Table} variable specifications
    //@return nothing
    //@except when specified initial value is not basic
    addInstanceVariables: function(module, vars_) {
      const fields = this.instanceFields;
      const descriptor = { configurable: false, enumerable: true, writable: true };
      for (let key in vars_) {
        const substance = vars_[key];
        // demand primitive thing that can be safely shared by all instances
        this.assert(I.isPrimitiveThing(substance));
        fields.store(Field.create(fields, key, module, substance, true), key);
        descriptor.value = substance;
        Object.defineProperty(this.instancePrototype, key, descriptor);
      }
    },
    //@ Add new child behavior that inherits from this behavior.
    //@param behaviorClass {Std.Logic.Behavior} behavior class instantiates new child behavior
    //@param legacy {Std.Closure?} legacy constructor of new child behavior
    //@return {Std.Logic.Behavior} new child behavior
    addNewChildBehavior: function(behaviorClass, legacy) {
      const childBehavior = Object.create(behaviorClass.instancePrototype);
      const prototype = legacy ? legacy.prototype : Object.create(this.instancePrototype);
      childBehavior.instancePrototype = prototype;
      childBehavior.instanceConstructor = legacy;
      childBehavior.inheritanceDepth = this.inheritanceDepth + 1;
      childBehavior.parentBehavior = this;
      childBehavior.childBehaviors = [];
      childBehavior.behaviorFlags_ = Object.create(this.behaviorFlags_);
      this.childBehaviors.push(childBehavior);
      return childBehavior;
    },
    //@ Create instance of this concrete behavior.
    //@param ... {[any]} construction arguments
    //@return {Any} new instance of this behavior
    //@except when this behavior is abstract
    create: function() {
      this.assert(!this.behaviorFlags_.Abstract);
      const Constructor = this.instanceConstructor;
      return new Constructor(arguments);
    },
    //@ Create instance constructor of this concrete behavior.
    //@return {Std.Closure} new constructor
    createConstructor: I.shouldNotOccur,
    //@ Test whether it is an instance of this behavior.
    //@param it {any} instance to test
    //@return {boolean} true if it is an instance, otherwise false
    describes: function(it) {
      return this.instanceConstructor ? it instanceof this.instanceConstructor :
        !this.instancePrototype ||
        Object.prototype.isPrototypeOf.call(this.instancePrototype, it);
    },
    //@ Find most specific behavior for an instance of this behavior.
    //@param instance {Any} instance of this behavior
    //@return {Std.Logic.Behavior} most specific behavior of instance
    downcast: function(instance) {
      const isPrototypeOf = Object.prototype.isPrototypeOf;
      for (let child of this.childBehaviors) {
        if (isPrototypeOf.call(child.instancePrototype, instance)) {
          return child.downcast(instance);
        }
      }
      return this;
    },
    //@ Enumerate all service behaviors from this behavior up to the root.
    //@param it {Any} service provider
    //@param visit {Std.Closure} visit returns false to stop enumeration
    //@return {boolean} true if all service behaviors were visited, otherwise false
    enumerateServices: function(it, visit) {
      if (this.behaviorFlags_.Service && !this.traitBehavior && visit(this) === false) {
        return false;
      }
      return this.parentBehavior === this || this.parentBehavior.enumerateServices(it, visit);
    },
    //@ Inheritance depth is distance from root to this behavior.
    //@return {integer} distance to root
    getInheritanceDepth: function() {
      return this.inheritanceDepth;
    },
    //@ Determine base for mixin operation that might have created this behavior.
    //@param traitBehavior {Std.Logic.Behavior} suggested trait behavior
    //@return {Std.Logic.Behavior} this behavior or an ancestor
    getMixedBase: function(traitBehavior) {
      return this.traitBehavior !== (traitBehavior.traitBehavior || traitBehavior) ? this :
        this.parentBehavior.getMixedBase(traitBehavior.parentBehavior);
    },
    //@ Find child of this behavior that was created with a trait.
    //@param traitBehavior {Std.Logic.Behavior} trait behavior of found child
    //@return {Std.Logic.Behavior?} found child or nothing
    getMixedChild: function(traitBehavior) {
      return this.childBehaviors.find(child => child.traitBehavior === traitBehavior);
    },
    //@ Get package this behavior owns.
    //@return {Std.Logic.ClassPackage|Std.Logic.MetaclassPackage} class or metaclass package
    getPackage: function() {
      return this.behaviorPackage;
    },
    //@ Get parent from which this behavior inherits.
    //@return {Std.Logic.Behavior} parent behavior
    getParentBehavior: function() {
      return this.parentBehavior;
    },
    //@ Get instance prototype of parent behavior.
    //@return {Any} prototype
    getParentPrototype: function() {
      return this.parentBehavior.instancePrototype;
    },
    //@ Get instance prototype of this behavior.
    //@return {Any} prototype
    getPrototype: function() {
      return this.instancePrototype;
    },
    //@ Get trait behavior whose definitions have been copied to this behavior.
    //@return {Std.Logic.Behavior?} trait behavior or nothing
    getTraitBehavior: function() {
      return this.traitBehavior;
    },
    //@ Test whether this behavior cannot create instances.
    //@return {boolean} true if this behavior cannot create instances, otherwise false
    isAbstract: function() {
      return this.behaviorFlags_.Abstract;
    },
    //@ Test whether this behavior cannot create children.
    //@return {boolean} true if this behavior can not have child behaviors, otherwise false
    isFinal: function() {
      return this.behaviorFlags_.Final;
    },
    //@ Test whether this behavior inherits the definitions of a trait.
    //@param traitBehavior {Std.Logic.Behavior} trait behavior
    //@return {boolean} true if this class or an ancestor has trait behavior, otherwise false
    isMixedBy: function(traitBehavior) {
      return this.traitBehavior === traitBehavior ||
        this.parentBehavior !== this && this.parentBehavior.isMixedBy(traitBehavior);
    },
    //@ Test whether this is the root behavior that inherits from itself.
    //@return {boolean} true if this behavior is its own parent behavior, otherwise false
    isRootBehavior: function() {
      return this.parentBehavior === this;
    },
    //@ Test whether this behavior is a service with providing instances.
    //@return {boolean} true if this behavior or an ancestor is a service, otherwise false
    isService: function() {
      return this.behaviorFlags_.Service;
    },
    //@ Assign values to instance constants.
    //@param constants_ {Std.Table} mapping from constant name to value
    //@return nothing
    //@except when name is not an instance constant name
    lockInstanceConstants: function(constants_) {
      for (let key in constants_) {
        const constant = this.instanceFields.find(key);
        this.assert(constant)
          .assert(!constant.isVariable(), !constant.hasSubstance());
        I.defineConstant(this.instancePrototype, key, constants_[key]);
      }
    },
    //@ Refine instance methods with new implementations.
    //@param module {Std.Logic.Module} module where refinements are located
    //@param methods_ {Std.Table} mapping from method name to refined code
    //@param formers_ {Std.Table} accumulator for old code of refined methods
    //@return nothing
    //@except when name is not an instance method name
    //@except when refined code is not a closure
    refineInstanceMethods: function(module, methods_, formers_) {
      const fields = this.instanceFields;
      const descriptor = { configurable: true, enumerable: false, writable: false };
      for (let key in methods_) {
        const substance = methods_[key], method = fields.lookup(key);
        this.assert(I.isClosure(substance), method)
          .assert(!method.isVariable(), method.hasSubstance());
        // collect former closure substance (to support invocation from refined methods)
        formers_[key] = method.refineSubstance(substance, module);
        descriptor.value = substance;
        Object.defineProperty(this.instancePrototype, key, descriptor);
      }
    },
    //@ Assign behavior flags.
    //@param flags_ {Std.Table} flag values
    //@return nothing
    //@except when flag value is not boolean
    //@except when flag is already specified
    //@except when flag name is unknown and this is not the root behavior
    setBehaviorFlags: function(flags_) {
      const behaviorFlags_ = this.behaviorFlags_;
      for (let key in flags_) {
        const value = flags_[key];
        this.assert(typeof value === 'boolean', !I.isPropertyOwner(behaviorFlags_, key))
          // root behavior can introduce new behavior flags
          .assert(typeof behaviorFlags_[key] === 'boolean' || this.parentBehavior === this);
        behaviorFlags_[key] = value;
      }
    }
  });
  I.share({
    //@{Std.Logic.Class} class of behavior packages
    BehaviorPackage: null
  });
})