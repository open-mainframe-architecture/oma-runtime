function boot(bundleId, bootName) {
  "use strict";
  // runtime system boots at t0
  var t0 = new Date();
  // create subclass method for strings, e.g. 'Std.BaseObject'.subclass(function(I) { ... })
  Object.defineProperty(String.prototype, 'subclass', {
    configurable: true, enumerable: false, writable: false, value: function() {
      var n = arguments.length - 1, clsSpec = {$super: this, script: arguments[n]};
      for (var i = 0; i < n; ++i) {
        var argument = arguments[i];
        if (typeof argument === 'function') {
          clsSpec.legacy = argument;
        } else if (Array.isArray(argument)) {
          clsSpec.depends = argument;
        } else {
          clsSpec.requires = argument;
        }
      }
      return clsSpec;
    }
  });
  // create and load boot module
  function loadBootModule(bootSpec_) {
    // JavaScript constants and primitives
    var protoObject = Object.prototype;
    var create = Object.create;
    var defineProperty = Object.defineProperty;
    var freeze = Object.freeze;
    var owns = protoObject.hasOwnProperty;
    var push = Array.prototype.push;
    var seal = Object.seal;
    // add constant property (non-configurable, non-enumerable and non-writable)
    function defineConstant(it, key, constant) {
      var descriptor = {value: constant, configurable: false, enumerable: false, writable: false};
      defineProperty(it, key, descriptor);
    }
    // runtime tables are not polluted with properties from Object.prototype
    var protoTable = freeze(create(null));
    // create tables that holds namespace entries
    var Root_ = create(protoTable), Std_ = create(Root_);
    var Rt_ = create(Root_), Logic_ = create(Std_);
    // create chain of prototypes to Class and Metaclass
    var protoBaseObject = create(protoObject);
    var protoBaseObjectCtxl = create(protoBaseObject);
    var protoBaseObjectLgcl = create(protoBaseObjectCtxl);
    var protoBaseObjectLgclIx = create(protoBaseObjectLgcl);
    var protoBaseObjectLgclCtxt = create(protoBaseObjectLgclIx);
    var protoBehavior = create(protoBaseObjectLgclCtxt);
    var protoClass = create(protoBehavior);
    var protoMetaclass = create(protoBehavior);
    // create class/metaclass pair
    function pair(superCls, instancePrototype, legacyConstructor) {
      var metacls = create(protoMetaclass);
      var classPrototype = create(superCls ? superCls.$.instancePrototype : protoClass);
      var instCls = create(classPrototype);
      defineConstant(classPrototype, '$', metacls);
      metacls.instancePrototype = classPrototype;
      metacls.homeContext = instCls;
      metacls.contextKey = '$';
      metacls.childBehaviors = [];
      instCls.childBehaviors = [];
      if (superCls) {
        instCls.instancePrototype = instancePrototype || create(superCls.instancePrototype);
        instCls.instanceConstructor = legacyConstructor;
        instCls.parentBehavior = superCls;
        instCls.behaviorFlags_ = create(superCls.behaviorFlags_);
        superCls.childBehaviors.push(instCls);
      } else {
        instCls.instancePrototype = null;
        instCls.parentBehavior = instCls;
        instCls.behaviorFlags_ = create(protoTable);
      }
      return instCls;
    }
    // create named class/metaclass pair
    function cls(ns_, key, superCls, instancePrototype, legacyConstructor) {
      var instCls = pair(superCls, instancePrototype, legacyConstructor);
      instCls.contextKey = key;
      ns_[key] = instCls;
      return instCls;
    }
    // create mixed-in class/metaclass pair
    function mix(superCls, mixin, instancePrototype) {
      var instCls = pair(superCls, instancePrototype);
      var mixedIns = mixin.mixedInClasses || (mixin.mixedInClasses = []);
      instCls.traitBehavior = mixin;
      instCls.behaviorFlags_.Abstract = true;
      mixedIns.push(instCls);
      return instCls;
    }
    // setup initial class hierarchy with bootstrapped prototypes
    var Void = cls(Root_, 'Void');
    cls(Rt_, 'Table', Void, protoTable);
    var Pojo = cls(Root_, 'Object', Void, protoObject, Object);
    var BaseObject = cls(Std_, 'BaseObject', Pojo, protoBaseObject);
    var Trait = cls(Std_, 'Trait', BaseObject);
    var Ix = cls(Std_, 'Indexable', Trait);
    var Ctxl = cls(Std_, 'Contextual', Trait);
    var Lgcl = cls(Std_, 'Logical', Ctxl);
    var Ctxt = cls(Std_, 'Context', mix(Ctxl, Ix));
    var BaseObjectCtxl = mix(BaseObject, Ctxl, protoBaseObjectCtxl);
    var BaseObjectLgcl = mix(BaseObjectCtxl, Lgcl, protoBaseObjectLgcl);
    var BaseObjectLgclIx = mix(BaseObjectLgcl, Ix, protoBaseObjectLgclIx);
    var BaseObjectLgclCtxt = mix(BaseObjectLgclIx, Ctxt, protoBaseObjectLgclCtxt);
    var Behavior = cls(Logic_, 'Behavior', BaseObjectLgclCtxt, protoBehavior);
    var Class = cls(Logic_, 'Class', Behavior, protoClass);
    var Metaclass = cls(Logic_, 'Metaclass', Behavior, protoMetaclass);
    // create classes that are necessary to execute class scripts of boot module
    var Field = cls(Logic_, 'Field', BaseObjectLgcl);
    var InstanceField = cls(Logic_, 'InstanceField', Field);
    var InstanceVariable = cls(Logic_, 'InstanceVariable', InstanceField);
    var InstanceAccessor = cls(Logic_, 'InstanceAccessor', InstanceField);
    var InstanceConstant = cls(Logic_, 'InstanceConstant', InstanceField);
    var InstanceMethod = cls(Logic_, 'InstanceMethod', InstanceField);
    var PackageField = cls(Logic_, 'PackageField', Field);
    var PackageConstant = cls(Logic_, 'PackageConstant', PackageField);
    var Subroutine = cls(Logic_, 'Subroutine', PackageField);
    var Container = cls(Std_, 'Container', mix(BaseObject, Ix));
    var Dictionary = cls(Std_, 'Dictionary', Container);
    var DictionaryLgcl = mix(mix(Dictionary, Ctxl), Lgcl);
    var ClassPackage = cls(Logic_, 'ClassPackage', DictionaryLgcl);
    var LogicalContainer = cls(Logic_, 'LogicalContainer', mix(DictionaryLgcl, Ctxt));
    var Module = cls(Logic_, 'Module', LogicalContainer);
    var Namespace = cls(Logic_, 'Namespace', LogicalContainer);
    var FieldContainer = cls(Logic_, 'FieldContainer', LogicalContainer);
    var InstanceFields = cls(Logic_, 'InstanceFields', FieldContainer);
    var MetaclassPackage = cls(Logic_, 'MetaclassPackage', FieldContainer);
    // create uninitialized instance of class
    function basicCreate(instCls) {
      return create(instCls.instancePrototype);
    }
    // create (and collect) namespace object that might wrap an existing table
    var bootNamespaces = [];
    function createNamespace(parentNs, key, ns_) {
      var ns = basicCreate(Namespace);
      if (parentNs) {
        ns.homeContext = ns.baseDictionary = parentNs;
      } else {
        ns.homeContext = parentNs = ns;
      }
      ns.contextKey = key;
      if (ns_) {
        // claim ownership of logicals in existing table
        Object.getOwnPropertyNames(ns._ = ns_).forEach(function(key) {
          ns_[key].homeContext = ns;
        });
      }
      else {
        ns._ = create(parentNs._);
      }
      parentNs._[key] = ns;
      bootNamespaces.push(ns);
      return ns;
    }
    // wrap tables of bootstrapped namespaces in proper namespace objects
    var Root = createNamespace(null, 'Root', Root_), Std = createNamespace(Root, 'Std', Std_);
    createNamespace(Root, 'Rt', Rt_);
    createNamespace(Std, 'Logic', Logic_);
    // visit inheritance tree in top-down or bottom-up order
    function enumerateBehaviors(behavior, visitFirst, bottomUp, visit) {
      var children = behavior.childBehaviors;
      if (visitFirst && !bottomUp) {
        visit(behavior);
      }
      children.forEach(function(child) { enumerateBehaviors(child, true, bottomUp, visit); });
      if (visitFirst && bottomUp) {
        visit(behavior);
      }
    }
    // bottom-up construction of metaclass hierarchy
    enumerateBehaviors(Void, true, true, function(instCls) {
      var metacls = instCls.$;
      var parentBehavior = instCls.parentBehavior;
      // metaclass hierarchy mirrors class hierarchy, except in the root class
      var metaParent = parentBehavior === instCls ? Class : parentBehavior.$;
      metacls.parentBehavior = metaParent;
      metaParent.childBehaviors.push(metacls);
    });
    // generic function to initialize behavior packages and instance fields
    function addBehaviorDictionary(behavior, ivar, key, dictionaryClass) {
      var dictionary = basicCreate(dictionaryClass);
      var baseDictionary = behavior.parentBehavior[ivar];
      dictionary.homeContext = behavior;
      dictionary.contextKey = key;
      dictionary.baseDictionary = baseDictionary;
      dictionary._ = create(baseDictionary ? baseDictionary._ : protoTable);
      behavior[ivar] = dictionary;
      return dictionary;
    }
    // initialize behavior package (either ClassPackage or MetaclassPackage)
    function addBehaviorPackage(behavior, packageClass) {
      behavior._ = addBehaviorDictionary(behavior, 'behaviorPackage', '_', packageClass)._;
    }
    // top-down initialization of metaclass packages and flags
    enumerateBehaviors(Class, false, false, function(metacls) {
      addBehaviorPackage(metacls, MetaclassPackage);
      metacls.behaviorFlags_ = create(metacls.parentBehavior.behaviorFlags_);
    });
    // initialize instance fields
    function addInstanceFieldContainer(behavior) {
      addBehaviorDictionary(behavior, 'instanceFields', '#', InstanceFields);
    }
    // derive base class of mixin operation that created mixed-in class
    function mixinBase(instCls, traitCls) {
      var mixin = instCls.traitBehavior;
      if (!mixin || mixin !== traitCls && mixin !== traitCls.traitBehavior) {
        return instCls;
      }
      return mixinBase(instCls.parentBehavior, traitCls.parentBehavior);
    }
    // get or compute fully qualified name of logical object
    function logicName(logical) {
      if (logical.logicName) {
        return logical.logicName;
      }
      var keys = [logical.contextKey], home = logical.homeContext, nextHome;
      while ((nextHome = home.homeContext) !== home) {
        keys.unshift(home.contextKey);
        home = nextHome;
      }
      logical.logicName = keys.join('.');
      return logical.logicName;
    }
    // top-down initialization of instance side
    enumerateBehaviors(Class, false, false, function(metacls) {
      var instCls = metacls.homeContext;
      var mixin = instCls.traitBehavior;
      addInstanceFieldContainer(instCls);
      addBehaviorPackage(instCls, ClassPackage);
      if (mixin) {
        metacls.traitBehavior = mixin.$;
        instCls.homeContext = instCls.parentBehavior.homeContext;
        instCls.contextKey = mixinBase(instCls, mixin).contextKey + '+' + logicName(mixin);
      }
    });
    // complete initialization of metaclasses
    enumerateBehaviors(Class, false, false, addInstanceFieldContainer);
    // test whether behavior is a trait class, but not necessarily a mixin
    var isTraitClass = protoObject.isPrototypeOf.bind(Trait.$.instancePrototype);
    // test whether class includes a mixin
    function hasMixin(cls, mixin) {
      if (mixin === Trait) {
        return true;
      }
      for (var childCls; childCls !== cls; childCls = cls, cls = cls.parentBehavior) {
        if (cls.traitBehavior === mixin) {
          return true;
        }
      }
      return false;
    }
    // find mixed-in subclass
    function mixedSubclass(superCls, mixin) {
      for (var i = 0, children = superCls.childBehaviors, n = children.length; i < n; ++i) {
        if (children[i].traitBehavior === mixin) {
          return children[i];
        }
      }
    }
    // find or create namespace for new logical
    function createHomeContext(keys) {
      for (var i = 0, n = keys.length - 1, home = Root; i < n; ++i) {
        home = owns.call(home._, keys[i]) ? home._[keys[i]] : createNamespace(home, keys[i]);
      }
      return home;
    }
    // resolve logic name
    function resolveKeys(relative, keys) {
      var n = keys.length;
      if (n) {
        // lookup first key, possibly in ancestor namespace
        relative = relative._[keys[0]];
        for (var i = 1; relative && i < n; ++i) {
          // other keys must be owned by namespace
          relative = relative._ && owns.call(relative._, keys[i]) && relative._[keys[i]];
        }
      }
      return relative;
    }
    function resolve(relative, name) {
      return resolveKeys(relative, name.split('.'));
    }
    // create new child of parent behavior
    function addChildBehavior(key, parentBehavior, behaviorClass, packageClass, legacy) {
      var childBehavior = basicCreate(behaviorClass);
      childBehavior.contextKey = key;
      var prototype = legacy ? legacy.prototype : create(parentBehavior.instancePrototype);
      childBehavior.instancePrototype = prototype;
      childBehavior.instanceConstructor = legacy;
      childBehavior.parentBehavior = parentBehavior;
      childBehavior.childBehaviors = [];
      childBehavior.behaviorFlags_ = create(parentBehavior.behaviorFlags_);
      addInstanceFieldContainer(childBehavior);
      addBehaviorPackage(childBehavior, packageClass);
      parentBehavior.childBehaviors.push(childBehavior);
      return childBehavior;
    }
    // create new class/metaclass pair
    function createClassPair(ns, key, clsSpec, superCls) {
      var metacls = addChildBehavior('$', superCls.$, Metaclass, MetaclassPackage);
      var instCls = addChildBehavior(key, superCls, metacls, ClassPackage, clsSpec.legacy);
      defineConstant(metacls.instancePrototype, '$', metacls);
      metacls.homeContext = instCls;
      instCls.homeContext = ns;
      return instCls;
    }
    // create and store instance field
    function addInstanceField(behavior, fieldCls, key, substance) {
      var field = basicCreate(fieldCls), fields = behavior.instanceFields;
      field.homeContext = fields;
      field.contextKey = key;
      field.fieldSubstance = substance;
      fields._[key] = field;
      return field;
    }
    // loader struct for classes of boot module
    function Loader(subject, clsSpec) {
      if (Array.isArray(subject)) {
        this.home = createHomeContext(subject);
        this.key = subject[subject.length - 1];
      } else {
        this.subject = subject;
      }
      this.spec = clsSpec;
      this.superParts = clsSpec.$super.split('+');
    }
    // create mixed-in class and register appropriate class loader
    function addMixin(superCls, traitCls, bootSpec_, bootLoading_) {
      var instCls, mixin = traitCls.traitBehavior;
      if (!mixin) {
        if (hasMixin(superCls, traitCls)) {
          return superCls;
        }
        instCls = mixedSubclass(superCls, traitCls);
        if (instCls) {
          return instCls;
        }
      }
      superCls = addMixin(superCls, traitCls.parentBehavior, bootSpec_, bootLoading_);
      if (mixin) {
        // recurse after parent trait class has been added, and trait class itself is mixed-in
        return addMixin(superCls, mixin, bootSpec_, bootLoading_);
      }
      // create mixed-in class
      var mixinName = logicName(traitCls), clsSpec = bootSpec_[mixinName];
      var key = mixinBase(superCls, traitCls.parentBehavior).contextKey + '+' + mixinName;
      instCls = createClassPair(superCls.homeContext, key, clsSpec, superCls);
      instCls.traitBehavior = traitCls;
      instCls.$.traitBehavior = traitCls.$;
      instCls.behaviorFlags_.Abstract = true;
      var mixedIns = traitCls.mixedInClasses || (traitCls.mixedInClasses = []);
      mixedIns.push(instCls);
      bootLoading_[logicName(instCls)] = new Loader(instCls, clsSpec);
      return instCls;
    }  
    // attempt to create class of loader
    function createClass(loader, bootSpec_, bootLoading_) {
      var ns = loader.home, superParts = loader.superParts, i, n = superParts.length;
      for (i = 0; i < n; ++i) {
        if (typeof superParts[i] === 'string') {
          var part = resolve(ns, superParts[i]);
          if (!part) {
            // unable to create part now, but perhaps it's possible later on
            return;
          }
          superParts[i] = part;
        }
      }
      // add mixins in specified order (first part is class, other parts are mixins)
      var superCls = superParts[0];
      for (i = 1; i < n; ++i) {
        superCls = addMixin(superCls, superParts[i], bootSpec_, bootLoading_);
      }
      var instCls = ns._[loader.key] = createClassPair(ns, loader.key, loader.spec, superCls);
      return instCls;
    }
    // execute keywords in class scripts
    function scriptAm(flags_) { //jshint validthis:true
      var behaviorFlags_ = this.$.behaviorFlags_;
      for (var key in flags_) {
        behaviorFlags_[key] = flags_[key];
      }
    }
    function scriptHave(variables_) { //jshint validthis:true
      var behavior = this.$, proto = behavior.instancePrototype;
      var descriptor = {configurable: false, enumerable: true, writable: true};
      for (var key in variables_) {
        descriptor.value = variables_[key];
        defineProperty(proto, key, descriptor);
        addInstanceField(behavior, InstanceVariable, key, descriptor.value);
      }
    }
    function scriptAccess(getters_) { //jshint validthis:true
      var behavior = this.$, proto = behavior.instancePrototype;
      var descriptor = {configurable: true, enumerable: false};
      for (var key in getters_) {
        var getter = descriptor.get = getters_[key];
        defineProperty(proto, key, descriptor);
        addInstanceField(behavior, InstanceAccessor, key, {get: getter});
      }
    }
    function scriptKnow(knowledge_) { //jshint validthis:true
      var behavior = this.$, proto = behavior.instancePrototype;
      var descriptor = {configurable: true, enumerable: false, writable: false};
      for (var key in knowledge_) {
        var substance = descriptor.value = knowledge_[key];
        defineProperty(proto, key, descriptor);
        addInstanceField(behavior, substance ? InstanceMethod : InstanceConstant, key, substance);
      }
    }
    function scriptShare(substances_) { //jshint validthis:true
      var instCls = this.$, metacls = instCls.$, packageFields = metacls.behaviorPackage;
      var fieldSubstances_ = instCls.behaviorPackage._;
      var descriptor = {configurable: false, enumerable: true, writable: false};
      for (var key in substances_) {
        var substance = substances_[key];
        var field = basicCreate(typeof substance === 'function' ? Subroutine : PackageConstant);
        field.homeContext = packageFields;
        field.contextKey = key;
        field.fieldSubstance = substance;
        packageFields._[key] = field;
        descriptor.value = substance;
        defineProperty(fieldSubstances_, key, descriptor);
      }
    }
    var bootSetup = [], scriptSetup = push.bind(bootSetup);
    // load class by executing class script
    function loadClass(loader, bootModule) {
      var instCls = loader.subject, scriptInst = create(instCls._);
      var metacls = instCls.$, scriptMeta = create(protoTable);
      // non-enumerable script keywords remain visible
      defineConstant(scriptInst, '$', instCls);
      defineConstant(scriptMeta, '$', metacls);
      defineConstant(scriptInst, '$super', instCls.parentBehavior.instancePrototype);
      defineConstant(scriptMeta, '$super', metacls.parentBehavior.instancePrototype);
      defineConstant(scriptInst, '_', (instCls.traitBehavior || instCls).homeContext._);
      defineConstant(scriptInst, '$module', bootModule);
      if (instCls.traitBehavior) {
        defineConstant(scriptInst, '$mixin', instCls.traitBehavior);
      }
      // enumerable script keywords are only visible while script is executing
      scriptInst.am = scriptAm;
      scriptInst.have = scriptMeta.have = scriptHave;
      scriptInst.access = scriptMeta.access = scriptAccess;
      scriptInst.know = scriptMeta.know = scriptKnow;
      scriptInst.share = scriptShare;
      scriptInst.setup = scriptSetup;
      var script = loader.spec.script;
      script(freeze(create(scriptInst)), freeze(create(scriptMeta)));
      // mixin holds on to class spec, because creation of mixed-in class runs class script again
      if (isTraitClass(instCls) && !instCls.traitBehavior) {
        instCls.mixedInClasses = instCls.mixedInClasses || [];
        instCls.definingSpecs = [loader.spec, bootModule];
      }
      // remove enumerable script keywords
      var keyword;
      for (keyword in scriptInst) {
        delete scriptInst[keyword];
      }
      for (keyword in scriptMeta) {
        delete scriptMeta[keyword];
      }
    }
    // load and execute class scripts of boot module
    function loadClasses(bootModule, bootSpec_) {
      // add loaders for bootstrapped classes
      var bootLoading_ = {}, loaders = [];
      enumerateBehaviors(Class, false, false, function(metacls) {
        var instCls = metacls.homeContext, mixin = instCls.traitBehavior;
        var name = logicName(instCls);
        bootLoading_[name] = new Loader(instCls, bootSpec_[mixin ? logicName(mixin) : name]);
      });
      // add loaders for other classes
      for (var name in bootSpec_) {
        if (name) {
          var keys = name.split('.');
          if (!resolveKeys(Root, keys)) {
            var loader = new Loader(keys, bootSpec_[name]);
            bootLoading_[name] = loader;
            loaders.push(loader);
          }
        }
      }
      // create classes until creation is no longer possible
      var loading, limit = loaders.length;
      do {
        loading = 0;
        for (var i = 0; i < limit; ++i) {
          var creator = loaders[i];
          var subject = creator.subject = createClass(creator, bootSpec_, bootLoading_);
          if (!subject) {
            loaders[loading++] = creator;
          }
        }
      } while (loading < limit && (limit = loading));
      if (loading) {
        throw 'Unbootable module.';
      }
      // run class scripts in breadth-first traversal
      var queue = Class.childBehaviors.slice();
      while (queue.length) {
        var metacls = queue.shift();
        push.apply(queue, metacls.childBehaviors);
        loadClass(bootLoading_[logicName(metacls.homeContext)], bootModule);
      }
    }
    function unveilObject(object) {
      // copy uninitialized variable from prototype to ensure ownership
      for (var iv in object) {
        object[iv] = object[iv];
      }
      // seal owned properties and unveil new object
      seal(object).unveil();
    }
    // unveil logical of boot module
    function unveilLogical(logical) {
      logical.logicModules = [Boot];
      unveilObject(logical);
    }
    // unveil objects that a behavior has built
    function unveilBehavior(behavior) {
      behavior.inheritanceDepth = behavior.parentBehavior.inheritanceDepth + 1;
      behavior.instanceFields.enumerate(unveilLogical);
      unveilLogical(behavior.instanceFields);
      unveilLogical(behavior.behaviorPackage);
      unveilLogical(behavior);
    }
    // create basic boot module
    var bootKeys = bootName.split('.'), bootNs = createHomeContext(bootKeys);
    var Boot = bootNs._[bootKeys[bootKeys.length - 1]] = basicCreate(Module);
    Boot.homeContext = bootNs;
    Boot.contextKey = bootKeys[bootKeys.length - 1];
    // run class scripts, but not the setup routines
    loadClasses(Boot, bootSpec_);
    // unveil all objects built by boot module so far
    Void.inheritanceDepth = -1;
    enumerateBehaviors(Void, true, false, unveilBehavior);
    enumerateBehaviors(Class, false, false, function(metacls) {
      metacls.behaviorPackage.enumerate(unveilLogical);
    });
    bootNamespaces.forEach(function(ns) { unveilLogical(ns); });
    // run setup routines and complete initialization of boot module
    bootSetup.forEach(function(closure) { closure(); });
    Boot.assetBundle = Rt_.Image._.Bundle.create(bundleId);
    Boot.logicConfig = Logic_.Config.create(bootSpec_['']);
    unveilLogical(Boot);
    Boot.beLoaded(true);
    return Boot;
  }
  // return object with bundle method (like strings do when runtime system has been loaded)
  return {
    bundle: function(moduleSpecs_) {
      delete this.bundle;
      // boot module creates runtime system
      var Boot = loadBootModule(moduleSpecs_[bootName]), bundle = Boot.getBundle();
      Boot.$rt.bootTimestamp = t0;
      // load other modules from bundle
      delete moduleSpecs_[bootName];
      var loading, loaders = [], names = Object.keys(moduleSpecs_), limit = names.length;
      // sorted names ensure a child module is created after its parent
      names.sort().forEach(function(name) {
        loaders.push(bundle.createModuleLoader(name, moduleSpecs_[name]));
      });
      // attempt to load modules until it's no longer possible
      do {
        loading = 0;
        for (var i = 0; i < limit; ++i) {
          if (loaders[i].isReady()) {
            loaders[i].loadModule();
          }
          else {
            loaders[loading++] = loaders[i];
          }
        }
      } while (loading < limit && (limit = loading));
      if (loading) {
        throw 'Unbootable bundle.';
      }
      return function() { return bundle; }.play();
    }
  };
}