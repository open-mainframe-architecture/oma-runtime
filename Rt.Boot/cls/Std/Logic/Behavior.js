'BaseObject+Logical+Context'.subclass(function (I) {
  "use strict";
  // I describe how instances behave.
  I.have({
    // prototypical instance of this behavior
    instancePrototype: null,
    // legacy or computed constructor for new instances
    instanceConstructor: null,
    // distance from this behavior to the root in the inheritance hierarchy
    inheritanceDepth: 0,
    // parent of this behavior in the inheritance hierarchy
    parentBehavior: null,
    // array with children of this behavior
    childBehaviors: null,
    // optional trait behavior whose definitions have been copied into this behavior
    traitBehavior: null,
    // boolean flags of this behavior
    behaviorFlags_: null,
    // container for instance fields of this behavior
    instanceFields: null,
    // container for package fields or package field substances
    behaviorPackage: null,
    // expose table of behavior package for easy access
    _: null
  });
  I.know({
    unveil: function () {
      // preparation of basic behavior object copies uninitialized variables and seals it
      I.prepareNew(this);
      I.$super.unveil.call(this);
      if (!this.behaviorFlags_.Abstract && !this.instanceConstructor) {
        // concrete behaviors have instance constructors
        this.instanceConstructor = this.createConstructor();
        this.instanceConstructor.prototype = this.instancePrototype;
      }
    },
    buildLogical: function (context, key, module) {
      I.$super.buildLogical.call(this, context, key, module);
      var parent = this.parentBehavior;
      // instance fields and behavior package belong to same module as this behavior 
      this.instanceFields = I._.InstanceFields.create(parent.instanceFields, this, module);
      this.behaviorPackage = this.$_.BehaviorPackage.create(parent.behaviorPackage, this, module);
      this._ = this.behaviorPackage._;
    },
    // enumerate behavior package, meta behavior and instance fields of this behavior
    enumerate: function (visit) {
      return visit(this.behaviorPackage, '_') !== false &&
        visit(this.$, '$') !== false &&
        visit(this.instanceFields, '#') !== false;
    },
    // lookup behavior package, meta behavior or instance fields of this behavior
    lookup: function (ix) {
      switch (ix) {
        case '_': return this.behaviorPackage;
        case '$': return this.$;
        case '#': return this.instanceFields;
      }
    },
    // add new instance getters and setters to this behavior
    addInstanceAccessors: function (module, accessors_) {
      var fields = this.instanceFields;
      var descriptor = { configurable: true, enumerable: false };
      for (var key in accessors_) {
        var it = accessors_[key];
        // field substance is JavaScript object with get and set closure
        var substance = { get: typeof it === 'function' ? it : it.get, set: it.set };
        fields.store(I._.InstanceAccessor.create(fields, key, module, substance), key);
        descriptor.get = substance.get;
        descriptor.set = substance.set;
        Object.defineProperty(this.instancePrototype, key, descriptor);
      }
    },
    // add new instance methods and constants to this behavior
    addInstanceKnowledge: function (module, fields_) {
      var fields = this.instanceFields;
      var descriptor = { configurable: true, enumerable: false, writable: false };
      for (var key in fields_) {
        var substance = fields_[key];
        var Field = substance ? I._.InstanceMethod : I._.InstanceConstant;
        if (substance !== null && typeof substance !== 'function') {
          this.bad('knowledge', key);
        }
        fields.store(Field.create(fields, key, module, substance), key);
        descriptor.value = substance;
        Object.defineProperty(this.instancePrototype, key, descriptor);
      }
    },
    // add new instance variables to this behavior
    addInstanceVariables: function (module, vars_) {
      var fields = this.instanceFields;
      var descriptor = { configurable: false, enumerable: true, writable: true };
      for (var key in vars_) {
        var substance = vars_[key];
        // demand initial basic value, because it can be safely shared by all instances
        if (!I.isBasic(substance)) {
          this.bad('variable', key);
        }
        fields.store(I._.InstanceVariable.create(fields, key, module, substance), key);
        descriptor.value = substance;
        Object.defineProperty(this.instancePrototype, key, descriptor);
      }
    },
    // add new child behavior that inherits from this behavior
    addNewChildBehavior: function (behaviorClass, legacy) {
      var childBehavior = Object.create(behaviorClass.instancePrototype);
      var prototype = legacy ? legacy.prototype : Object.create(this.instancePrototype);
      childBehavior.instancePrototype = prototype;
      childBehavior.instanceConstructor = legacy;
      childBehavior.inheritanceDepth = this.inheritanceDepth + 1;
      childBehavior.parentBehavior = this;
      childBehavior.childBehaviors = [];
      childBehavior.behaviorFlags_ = Object.create(this.behaviorFlags_);
      this.childBehaviors.push(childBehavior);
      return childBehavior;
    },
    // create instance of this concrete behavior
    create: function () {
      if (this.behaviorFlags_.Abstract) {
        this.bad('creation');
      }
      return new this.instanceConstructor(arguments);
    },
    // create instance constructor of this concrete behavior
    createConstructor: I.shouldNotOccur,
    // test whether it is an instance of this behavior
    describes: function (it) {
      return this.instanceConstructor ? it instanceof this.instanceConstructor :
        !this.instancePrototype ||
        Object.prototype.isPrototypeOf.call(this.instancePrototype, it);
    },
    // find most specific behavior for an instance of this behavior
    downcast: function (instance) {
      var children = this.childBehaviors, isPrototypeOf = Object.prototype.isPrototypeOf;
      for (var i = 0, n = children.length; i < n; ++i) {
        if (isPrototypeOf.call(children[i].instancePrototype, instance)) {
          return children[i].downcast(instance);
        }
      }
      return this;
    },
    // enumerate all service behaviors from this behavior up to the root
    enumerateServices: function (it, visit) {
      if (this.behaviorFlags_.Service && !this.traitBehavior && visit(this) === false) {
        return false;
      }
      return this.parentBehavior === this || this.parentBehavior.enumerateServices(it, visit);
    },
    getInheritanceDepth: function () {
      return this.inheritanceDepth;
    },
    // determine base for mixin operation that might have created this behavior
    getMixedBase: function (traitBehavior) {
      if (this.traitBehavior !== (traitBehavior.traitBehavior || traitBehavior)) {
        return this;
      }
      return this.parentBehavior.getMixedBase(traitBehavior.parentBehavior);
    },
    // find child of this behavior that was created with a trait
    getMixedChild: function (traitBehavior) {
      var children = this.childBehaviors;
      for (var i = 0, n = children.length; i < n; ++i) {
        if (children[i].traitBehavior === traitBehavior) {
          return children[i];
        }
      }
    },
    getPackage: function () {
      return this.behaviorPackage;
    },
    getParentBehavior: function () {
      return this.parentBehavior;
    },
    getParentPrototype: function () {
      return this.parentBehavior.instancePrototype;
    },
    getPrototype: function () {
      return this.instancePrototype;
    },
    getTraitBehavior: function () {
      return this.traitBehavior;
    },
    // test whether this behavior cannot create instances
    isAbstract: function () {
      return this.behaviorFlags_.Abstract;
    },
    // test whether this behavior cannot create children
    isFinal: function () {
      return this.behaviorFlags_.Final;
    },
    // test whether this behavior inherits the definitions of a trait
    isMixedBy: function (traitBehavior) {
      if (this.traitBehavior === traitBehavior) {
        return true;
      }
      return this.parentBehavior !== this && this.parentBehavior.isMixedBy(traitBehavior);
    },
    isRootBehavior: function () {
      return this.parentBehavior === this;
    },
    // test whether this behavior is a service with providing instances
    isService: function () {
      return this.behaviorFlags_.Service;
    },
    lockInstanceConstants: function (constants_) {
      for (var key in constants_) {
        if (!I._.InstanceConstant.describes(this.instanceFields.find(key))) {
          this.bad('lock', key);
        }
        I.defineConstant(this.instancePrototype, key, constants_[key]);
      }
    },
    refineInstanceMethods: function (module, methods_, formers_) {
      var fields = this.instanceFields;
      var descriptor = { configurable: true, enumerable: false, writable: false };
      for (var key in methods_) {
        var substance = methods_[key];
        var method = fields.lookup(key);
        if (!I._.InstanceMethod.describes(method)) {
          this.bad('refinement', key);
        }
        if (typeof substance !== 'function') {
          this.bad('method', key);
        }
        // collect former closure substance (to support invocation from refined methods)
        formers_[key] = method.refineSubstance(substance, module);
        descriptor.value = substance;
        Object.defineProperty(this.instancePrototype, key, descriptor);
      }
    },
    setBehaviorFlags: function (flags_) {
      var behaviorFlags_ = this.behaviorFlags_;
      for (var key in flags_) {
        var value = flags_[key];
        if (typeof value !== 'boolean') {
          this.bad('flag', key);
        }
        if (I.isPropertyOwner(behaviorFlags_, key)) {
          this.bad('conflict', key);
        }
        // root behavior can introduce new behavior flags
        if (typeof behaviorFlags_[key] !== 'boolean' && this.parentBehavior !== this) {
          this.bad('target', key);
        }
        behaviorFlags_[key] = value;
      }
    }
  });
  I.share({
    BehaviorPackage: null
  });
})