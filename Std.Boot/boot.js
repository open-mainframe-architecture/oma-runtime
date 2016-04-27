function boot(bundleName, bootModuleName) {
  "use strict";
  // runtime system boots at t0
  const t0 = new Date();
  // create subclass method for strings, e.g. 'BaseObject'.subclass(function(I) { ... })
  Object.defineProperty(String.prototype, 'subclass', {
    configurable: true, enumerable: false, writable: false, value: function() {
      const n = arguments.length - 1, clsSpec = { super: this, script: arguments[n] };
      for (let i = 0; i < n; ++i) {
        const argument = arguments[i];
        if (typeof argument === 'function') {
          // legacy constructor function
          clsSpec.legacy = argument;
        } else if (Array.isArray(argument)) {
          // array with module names specifies dependencies 
          clsSpec.depends = argument;
        } else {
          // pojo specifies required services
          clsSpec.requires = argument;
        }
      }
      return clsSpec;
    }
  });
  return {
    // same interface as bundle method of strings after runtime is operational
    bundle: function(moduleSpecs_) {
      delete this.bundle;
      const bootSpec_ = moduleSpecs_[bootModuleName];
      delete moduleSpecs_[bootModuleName];
      // JavaScript constants and primitives
      const protoObject = Object.prototype, owns = protoObject.hasOwnProperty;
      const defineProperty = Object.defineProperty, freeze = Object.freeze, seal = Object.seal;
      const create = Object.create;
      // add constant property (non-configurable, non-enumerable and non-writable)
      function defineConstant(it, key, constant) {
        defineProperty(it, key, {
          value: constant, configurable: false, enumerable: false, writable: false
        });
      }
      // tables are not polluted with properties from Object.prototype
      const protoTable = freeze(create(null));
      // create tables that hold namespace entries
      const Root_ = create(protoTable), Std_ = create(Root_), Logic_ = create(Std_);
      // create chain of prototypes to Class and Metaclass
      const protoBaseObject = create(protoObject);
      const protoBaseObjectCtxl = create(protoBaseObject);
      const protoBaseObjectLgcl = create(protoBaseObjectCtxl);
      const protoBaseObjectLgclIx = create(protoBaseObjectLgcl);
      const protoBaseObjectLgclCtxt = create(protoBaseObjectLgclIx);
      const protoBehavior = create(protoBaseObjectLgclCtxt);
      const protoClass = create(protoBehavior);
      const protoMetaclass = create(protoBehavior);
      // create class/metaclass pair
      function pair(superCls, instancePrototype, legacyConstructor) {
        const classPrototype = create(superCls ? superCls.$.instancePrototype : protoClass);
        const metacls = create(protoMetaclass), instCls = create(classPrototype);
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
        const instCls = pair(superCls, instancePrototype, legacyConstructor);
        instCls.contextKey = key;
        ns_[key] = instCls;
        return instCls;
      }
      // create mixed-in class/metaclass pair
      function mix(superCls, mixin, instancePrototype) {
        const instCls = pair(superCls, instancePrototype);
        const mixedIns = mixin.mixedInClasses || (mixin.mixedInClasses = []);
        instCls.traitBehavior = mixin;
        instCls.behaviorFlags_.Abstract = true;
        mixedIns.push(instCls);
        return instCls;
      }
      // setup initial class hierarchy with bootstrapped prototypes
      const Any = cls(Root_, 'Any');
      cls(Std_, 'Table', Any, protoTable);
      const PlainObject = cls(Root_, 'Object', Any, protoObject, Object);
      const BaseObject = cls(Std_, 'BaseObject', PlainObject, protoBaseObject);
      const Trait = cls(Std_, 'Trait', BaseObject);
      const Ix = cls(Std_, 'Indexable', Trait);
      const Ctxl = cls(Std_, 'Contextual', Trait);
      const Lgcl = cls(Std_, 'Logical', Ctxl);
      const Ctxt = cls(Std_, 'Context', mix(Ctxl, Ix));
      const BaseObjectCtxl = mix(BaseObject, Ctxl, protoBaseObjectCtxl);
      const BaseObjectLgcl = mix(BaseObjectCtxl, Lgcl, protoBaseObjectLgcl);
      const BaseObjectLgclIx = mix(BaseObjectLgcl, Ix, protoBaseObjectLgclIx);
      const BaseObjectLgclCtxt = mix(BaseObjectLgclIx, Ctxt, protoBaseObjectLgclCtxt);
      const Behavior = cls(Logic_, 'Behavior', BaseObjectLgclCtxt, protoBehavior);
      const Class = cls(Logic_, 'Class', Behavior, protoClass);
      const Metaclass = cls(Logic_, 'Metaclass', Behavior, protoMetaclass);
      // create classes that are necessary to execute class scripts of boot module
      const Field = cls(Logic_, 'Field', BaseObjectLgcl);
      const Container = cls(Std_, 'Container', mix(BaseObject, Ix));
      const Dictionary = cls(Std_, 'Dictionary', Container);
      const DictionaryLgcl = mix(mix(Dictionary, Ctxl), Lgcl);
      const ClassPackage = cls(Logic_, 'ClassPackage', DictionaryLgcl);
      const LogicalContainer = cls(Logic_, 'LogicalContainer', mix(DictionaryLgcl, Ctxt));
      const Module = cls(Logic_, 'Module', LogicalContainer);
      const Namespace = cls(Logic_, 'Namespace', LogicalContainer);
      const FieldContainer = cls(Logic_, 'FieldContainer', LogicalContainer);
      const InstanceFields = cls(Logic_, 'InstanceFields', FieldContainer);
      const MetaclassPackage = cls(Logic_, 'MetaclassPackage', FieldContainer);
      // create uninitialized instance of class
      function basicCreate(instCls) {
        return create(instCls.instancePrototype);
      }
      // create (and collect) namespace object
      const bootNamespaces = [];
      function createNamespace(parentNs, key, ns_) {
        const ns = basicCreate(Namespace);
        if (parentNs) {
          ns.homeContext = ns.baseDictionary = parentNs;
        } else {
          ns.homeContext = parentNs = ns;
        }
        ns.contextKey = key;
        if (ns_) {
          // claim ownership of logicals in existing table
          for (let key of Object.getOwnPropertyNames(ns._ = ns_)) { ns_[key].homeContext = ns; }
        }
        else {
          ns._ = create(parentNs._);
        }
        parentNs._[key] = ns;
        bootNamespaces.push(ns);
        return ns;
      }
      // wrap tables of bootstrapped namespaces in proper namespace objects
      const Root = createNamespace(null, 'Root', Root_), Std = createNamespace(Root, 'Std', Std_);
      createNamespace(Std, 'Logic', Logic_);
      // visit inheritance tree in top-down or bottom-up order
      function enumerateBehaviors(behavior, visitFirst, bottomUp, visit) {
        const children = behavior.childBehaviors;
        if (visitFirst && !bottomUp) {
          visit(behavior);
        }
        for (let child of children) {
          enumerateBehaviors(child, true, bottomUp, visit);
        }
        if (visitFirst && bottomUp) {
          visit(behavior);
        }
      }
      // bottom-up construction of metaclass hierarchy
      enumerateBehaviors(Any, true, true, instCls => {
        const metacls = instCls.$, parentBehavior = instCls.parentBehavior;
        // metaclass hierarchy mirrors class hierarchy, except in the root class
        const metaParent = parentBehavior === instCls ? Class : parentBehavior.$;
        metacls.parentBehavior = metaParent;
        metaParent.childBehaviors.push(metacls);
      });
      // generic function to initialize behavior package and instance fields
      function addBehaviorDictionary(behavior, ivar, key, dictionaryClass) {
        const dictionary = basicCreate(dictionaryClass);
        const baseDictionary = behavior.parentBehavior[ivar];
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
      // top-down initialization of metaclass package and behavior flags
      enumerateBehaviors(Class, false, false, metacls => {
        addBehaviorPackage(metacls, MetaclassPackage);
        metacls.behaviorFlags_ = create(metacls.parentBehavior.behaviorFlags_);
      });
      // initialize instance fields
      function addInstanceFieldContainer(behavior) {
        addBehaviorDictionary(behavior, 'instanceFields', '#', InstanceFields);
      }
      // derive base class of mixin operation that created mixed-in class
      function mixinBase(instCls, traitCls) {
        const mixin = instCls.traitBehavior;
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
        const keys = [logical.contextKey];
        let home = logical.homeContext, nextHome;
        while ((nextHome = home.homeContext) !== home) {
          keys.unshift(home.contextKey);
          home = nextHome;
        }
        logical.logicName = keys.join('.');
        return logical.logicName;
      }
      // top-down initialization of instance side
      enumerateBehaviors(Class, false, false, metacls => {
        const instCls = metacls.homeContext, mixin = instCls.traitBehavior;
        addInstanceFieldContainer(instCls);
        addBehaviorPackage(instCls, ClassPackage);
        if (mixin) {
          metacls.traitBehavior = mixin.$;
          instCls.homeContext = instCls.parentBehavior.homeContext;
          instCls.contextKey = `${mixinBase(instCls, mixin).contextKey}+${logicName(mixin)}`;
        }
      });
      // complete initialization of metaclasses
      enumerateBehaviors(Class, false, false, addInstanceFieldContainer);
      // test whether class includes a mixin
      function hasMixin(cls, mixin) {
        if (mixin === Trait) {
          return true;
        }
        for (let previous = null; previous !== cls; previous = cls, cls = cls.parentBehavior) {
          if (cls.traitBehavior === mixin) {
            return true;
          }
        }
        return false;
      }
      // find or create namespace for new logical
      function createHomeContext(keys) {
        const n = keys.length - 1;
        let home = Root;
        for (let i = 0; i < n; ++i) {
          home = owns.call(home._, keys[i]) ? home._[keys[i]] : createNamespace(home, keys[i]);
        }
        return home;
      }
      // resolve logic name
      function resolveKeys(relative, keys) {
        const n = keys.length;
        if (n) {
          // look up first key, possibly in ancestor namespace
          relative = relative._[keys[0]];
          for (let i = 1; relative && i < n; ++i) {
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
        const childBehavior = basicCreate(behaviorClass);
        childBehavior.contextKey = key;
        const prototype = legacy ? legacy.prototype : create(parentBehavior.instancePrototype);
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
        const metacls = addChildBehavior('$', superCls.$, Metaclass, MetaclassPackage);
        const instCls = addChildBehavior(key, superCls, metacls, ClassPackage, clsSpec.legacy);
        defineConstant(metacls.instancePrototype, '$', metacls);
        metacls.homeContext = instCls;
        instCls.homeContext = ns;
        return instCls;
      }
      // create and store instance field
      function addInstanceField(behavior, key, substance, variable) {
        const field = basicCreate(Field), fields = behavior.instanceFields;
        field.homeContext = fields;
        field.contextKey = key;
        field.fieldSubstance = substance;
        field.variableSubstance = variable;
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
        this.superParts = clsSpec.super.split('+');
      }
      // create mixed-in class and register appropriate class loader
      function addMixin(superCls, traitCls, bootLoading_) {
        const mixin = traitCls.traitBehavior;
        if (!mixin) {
          if (hasMixin(superCls, traitCls)) {
            return superCls;
          }
          const instCls = superCls.childBehaviors.find(cls => cls.traitBehavior === traitCls);
          if (instCls) {
            return instCls;
          }
        }
        superCls = addMixin(superCls, traitCls.parentBehavior, bootLoading_);
        if (mixin) {
          // recurse after parent trait class has been added, and trait class itself is mixed-in
          return addMixin(superCls, mixin, bootLoading_);
        }
        // create mixed-in class
        const mixinName = logicName(traitCls), clsSpec = bootSpec_[mixinName];
        const key = `${mixinBase(superCls, traitCls.parentBehavior).contextKey}+${mixinName}`;
        const instCls = createClassPair(superCls.homeContext, key, clsSpec, superCls);
        instCls.traitBehavior = traitCls;
        instCls.$.traitBehavior = traitCls.$;
        instCls.behaviorFlags_.Abstract = true;
        const mixedIns = traitCls.mixedInClasses || (traitCls.mixedInClasses = []);
        mixedIns.push(instCls);
        bootLoading_[logicName(instCls)] = new Loader(instCls, clsSpec);
        return instCls;
      }
      // attempt to create class of loader
      function createClass(loader, bootLoading_) {
        const ns = loader.home, superParts = loader.superParts, n = superParts.length;
        for (let i = 0; i < n; ++i) {
          if (typeof superParts[i] === 'string') {
            const part = resolve(ns, superParts[i]);
            if (!part) {
              // unable to create part now, but perhaps it's possible later on
              return;
            }
            superParts[i] = part;
          }
        }
        // add mixins in specified order (first part is class, other parts are mixins)
        let superCls = superParts[0];
        for (let i = 1; i < n; ++i) {
          superCls = addMixin(superCls, superParts[i], bootLoading_);
        }
        const instCls = ns._[loader.key] = createClassPair(ns, loader.key, loader.spec, superCls);
        return instCls;
      }
      // execute keywords in class scripts
      function scriptAm(flags_) { //jshint validthis:true
        const behaviorFlags_ = this.$.behaviorFlags_;
        for (let key in flags_) {
          behaviorFlags_[key] = flags_[key];
        }
      }
      function scriptHave(variables_) { //jshint validthis:true
        const behavior = this.$, proto = behavior.instancePrototype;
        const descriptor = { configurable: false, enumerable: true, writable: true };
        for (let key in variables_) {
          descriptor.value = variables_[key];
          defineProperty(proto, key, descriptor);
          addInstanceField(behavior, key, descriptor.value, true);
        }
      }
      function scriptAccess(getters_) { //jshint validthis:true
        const behavior = this.$, proto = behavior.instancePrototype;
        const descriptor = { configurable: true, enumerable: false };
        for (let key in getters_) {
          const getter = descriptor.get = getters_[key];
          defineProperty(proto, key, descriptor);
          addInstanceField(behavior, key, { get: getter }, false);
        }
      }
      function scriptKnow(knowledge_) { //jshint validthis:true
        const behavior = this.$, proto = behavior.instancePrototype;
        const descriptor = { configurable: true, enumerable: false, writable: false };
        for (let key in knowledge_) {
          const substance = descriptor.value = knowledge_[key];
          defineProperty(proto, key, descriptor);
          addInstanceField(behavior, key, substance, false);
        }
      }
      function scriptShare(substances_) { //jshint validthis:true
        const instCls = this.$, metacls = instCls.$, packageFields = metacls.behaviorPackage;
        const fieldSubstances_ = instCls.behaviorPackage._;
        const descriptor = { configurable: false, enumerable: true, writable: false };
        for (let key in substances_) {
          const substance = substances_[key], field = basicCreate(Field);
          field.homeContext = packageFields;
          field.contextKey = key;
          field.fieldSubstance = substance;
          packageFields._[key] = field;
          descriptor.value = substance;
          defineProperty(fieldSubstances_, key, descriptor);
        }
      }
      const bootSetup = [], scriptSetup = bootSetup.push.bind(bootSetup);
      // create basic boot module
      const bootKeys = bootModuleName.split('.'), bootNs = createHomeContext(bootKeys);
      const Boot = bootNs._[bootKeys[bootKeys.length - 1]] = basicCreate(Module);
      Boot.homeContext = bootNs;
      Boot.contextKey = bootKeys[bootKeys.length - 1];
      // load class by executing class script
      function loadClass(loader) {
        const instCls = loader.subject, scriptInst = create(instCls._);
        const metacls = instCls.$, scriptMeta = create(protoTable);
        // non-enumerable script keywords remain visible
        defineConstant(scriptInst, '$', instCls);
        defineConstant(scriptMeta, '$', metacls);
        defineConstant(scriptInst, '$super', instCls.parentBehavior.instancePrototype);
        defineConstant(scriptMeta, '$super', metacls.parentBehavior.instancePrototype);
        defineConstant(scriptInst, '_', (instCls.traitBehavior || instCls).homeContext._);
        defineConstant(scriptInst, '$module', Boot);
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
        const script = loader.spec.script;
        script(freeze(create(scriptInst)), freeze(create(scriptMeta)));
        if (Trait.$.instancePrototype.isPrototypeOf(instCls) && !instCls.traitBehavior) {
          // hold on to mixin spec, because creation of mixed-in class runs class script again
          instCls.mixedInClasses = instCls.mixedInClasses || [];
          instCls.definingSpecs = [loader.spec, Boot];
        }
        // remove enumerable script keywords
        for (let keyword in scriptInst) {
          delete scriptInst[keyword];
        }
        for (let keyword in scriptMeta) {
          delete scriptMeta[keyword];
        }
      }
      // load and execute class scripts of boot module
      function loadClasses() {
        // add loaders for bootstrapped classes
        const bootLoading_ = {}, loaders = [];
        enumerateBehaviors(Class, false, false, metacls => {
          const instCls = metacls.homeContext, mixin = instCls.traitBehavior;
          const name = logicName(instCls);
          bootLoading_[name] = new Loader(instCls, bootSpec_[mixin ? logicName(mixin) : name]);
        });
        // add loaders for other classes
        for (let name in bootSpec_) {
          if (name) {
            const keys = name.split('.');
            if (!resolveKeys(Root, keys)) {
              const loader = new Loader(keys, bootSpec_[name]);
              bootLoading_[name] = loader;
              loaders.push(loader);
            }
          }
        }
        // create classes until creation is no longer possible
        let loading, limit = loaders.length;
        do {
          loading = 0;
          for (let i = 0; i < limit; ++i) {
            const loader = loaders[i];
            const subject = loader.subject = createClass(loader, bootLoading_);
            if (!subject) {
              loaders[loading++] = loader;
            }
          }
        } while (loading < limit && (limit = loading));
        if (loading) {
          throw 'Unbootable module.';
        }
        // run class scripts in breadth-first traversal
        const queue = Class.childBehaviors.slice();
        while (queue.length) {
          const metacls = queue.shift();
          queue.push(...metacls.childBehaviors);
          loadClass(bootLoading_[logicName(metacls.homeContext)]);
        }
      }
      function unveilObject(object) {
        // copy uninitialized, enumerable variable from prototype to ensure ownership
        for (let iv in object) {
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
      // run class scripts, but not the setup routines
      loadClasses();
      // unveil all objects built by boot module so far
      Any.inheritanceDepth = -1;
      enumerateBehaviors(Any, true, false, unveilBehavior);
      enumerateBehaviors(Class, false, false, metacls => {
        metacls.behaviorPackage.enumerate(unveilLogical);
      });
      for (let ns of bootNamespaces) {
        unveilLogical(ns);
      }
      // run setup routines and complete initialization of boot module
      for (let closure of bootSetup) {
        closure();
      }
      const bootBundle = Boot.assetBundle = Std_.Runtime._.Image._.Bundle.create(bundleName);
      Boot.logicConfig = Logic_.Config.create(bootSpec_['']);
      unveilLogical(Boot);
      Boot.$rt.bootTimestamp = t0;
      Boot.beLoaded(true);
      // load other modules from bundle (sorting ensures child module is created after parent)
      const loaders = Object.keys(moduleSpecs_).sort().map(name =>
        bootBundle.createModuleLoader(name, moduleSpecs_[name])
      );
      let loading, limit = loaders.length;
      // load modules until it's no longer possible
      function loadModules() {
        do {
          loading = 0;
          for (let i = 0; i < limit; ++i) {
            if (loaders[i].isReady()) {
              loaders[i].loadModule();
            }
            else {
              loaders[loading++] = loaders[i];
            }
          }
        } while (loading < limit && (limit = loading));
      }
      loadModules();
      // promise to load remaining modules, although most or all modules should be loaded by now
      return function() {
        // stage break gives parent environment opportunity to register service providers
        return this.$theater.stageBreak().triggers(() => {
          // load any remaining modules that depend on services from parent environment
          loadModules();
          if (loading) {
            this.$rt.asap(() => { throw 'Unbootable runtime.'; });
          }
          return bootBundle;
        });
      }.play();
    }
  };
}