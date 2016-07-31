function boot(bundleName, bootModuleName) {
  "use strict";
  // runtime system boots at t0
  const t0 = new Date();
  // create new subclass method for strings, which defines or redefines a class
  if (''.subclass) {
    throw new Error('duplicate runtime');
  }
  Reflect.defineProperty(String.prototype, 'subclass', {
    configurable: true, enumerable: false, writable: false, value: function() {
      const last = arguments.length - 1, clsSpec = {
        super: this.split('.'),
        script: arguments[last]
      };
      for (let i = 0; i < last; ++i) {
        const argument = arguments[i];
        if (typeof argument === 'function') {
          clsSpec.constructs = argument;
        } else if (Array.isArray(argument)) {
          clsSpec.depends = argument;
        } else {
          clsSpec.requires = argument;
        }
      }
      // return gathered class specification
      return clsSpec;
    }
  });
  // mimic bundle method of strings, which will be available when runtime is operational
  return {
    bundle: function(moduleSpecs) {
      delete this.bundle;
      const bootSpec = moduleSpecs[bootModuleName];
      delete moduleSpecs[bootModuleName];
      // hoist JavaScript constants and primitives
      const hasOwnProperty = Object.prototype.hasOwnProperty;
      const create = Object.create, freeze = Object.freeze, seal = Object.seal;
      const keysOf = Object.keys, defineProperty = Reflect.defineProperty;
      // lock constant property (non-configurable, non-enumerable and non-writable)
      function lockProperty(it, key, value) {
        defineProperty(it, key, {
          value: value, configurable: false, enumerable: false, writable: false
        });
      }
      // tables are methodless container objects
      const protoTable = freeze(create(null));
      // create tables that hold namespace entries
      const Root_ = create(protoTable), Std_ = create(Root_), Logic_ = create(Std_);
      // create chain of prototypes to Class and Metaclass
      const protoStdObject = create(null);
      const protoLogicObject = create(protoStdObject);
      const protoLogicContext = create(protoLogicObject);
      const protoBehavior = create(protoLogicContext);
      const protoClass = create(protoBehavior);
      const protoMetaclass = create(protoBehavior);
      // create class/metaclass pair
      function createClass(ns_, key, superCls, instancePrototype) {
        const classPrototype = create(superCls ? superCls.$.instancePrototype : protoClass);
        const metacls = create(protoMetaclass), instCls = create(classPrototype);
        lockProperty(classPrototype, '$', metacls);
        ns_[key] = metacls.logicContext = instCls;
        metacls.instancePrototype = classPrototype;
        metacls.logicKey = '$';
        instCls.logicKey = key;
        metacls.childBehaviors = [];
        instCls.childBehaviors = [];
        if (superCls) {
          instCls.instancePrototype = instancePrototype || create(superCls.instancePrototype);
          instCls.parentBehavior = superCls;
          instCls.behaviorFlags = create(superCls.behaviorFlags);
          superCls.childBehaviors.push(instCls);
        } else {
          instCls.instancePrototype = null;
          instCls.parentBehavior = instCls;
          instCls.behaviorFlags = create(protoTable);
        }
        return instCls;
      }
      // setup initial class hierarchy with bootstrapped prototypes
      const Void = createClass(Root_, 'Void');
      createClass(Std_, 'Table', Void, protoTable);
      const StdObject = createClass(Std_, 'Object', Void, protoStdObject);
      const LogicObject = createClass(Logic_, 'Object', StdObject, protoLogicObject);
      const LogicContext = createClass(Logic_, 'Context', LogicObject, protoLogicContext);
      const Behavior = createClass(Logic_, 'Behavior', LogicContext, protoBehavior);
      const Class = createClass(Logic_, 'Class', Behavior, protoClass);
      const Metaclass = createClass(Logic_, 'Metaclass', Behavior, protoMetaclass);
      // create classes that are necessary to execute class scripts of boot module
      const ClassPackage = createClass(Logic_, 'ClassPackage', LogicObject);
      const LogicContainer = createClass(Logic_, 'Container', LogicContext);
      const Module = createClass(Logic_, 'Module', LogicContainer);
      const Namespace = createClass(Logic_, 'Namespace', LogicContainer);
      const MetaclassPackage = createClass(Logic_, 'MetaclassPackage', LogicContainer);
      // create uninitialized instance of class
      function basicCreate(instCls) {
        return create(instCls.instancePrototype);
      }
      // create (and collect) namespace object
      const bootNamespaces = [];
      function createNamespace(parentNs, key, ns_) {
        const ns = basicCreate(Namespace);
        ns.logicContext = parentNs ? parentNs : (parentNs = ns);
        ns.logicKey = key;
        if (ns_) {
          // claim ownership of logic objects in existing table
          keysOf(ns._ = ns_).forEach(existingKey => { ns_[existingKey].logicContext = ns; });
        }
        else {
          ns._ = create(parentNs._);
        }
        parentNs._[key] = ns;
        bootNamespaces.push(ns);
        return ns;
      }
      // wrap tables of bootstrapped namespaces in proper namespace objects
      const Root = createNamespace(null, 'Root', Root_);
      createNamespace(createNamespace(Root, 'Std', Std_), 'Logic', Logic_);
      // visit inheritance tree in top-down or bottom-up order
      function enumerateBehaviors(behavior, visitFirst, bottomUp, visit) {
        const children = behavior.childBehaviors;
        if (visitFirst && !bottomUp) {
          visit(behavior);
        }
        children.forEach(child => enumerateBehaviors(child, true, bottomUp, visit));
        if (visitFirst && bottomUp) {
          visit(behavior);
        }
      }
      // bottom-up construction of metaclass hierarchy
      enumerateBehaviors(Void, true, true, instCls => {
        const metacls = instCls.$, parentBehavior = instCls.parentBehavior;
        // metaclass hierarchy mirrors class hierarchy, except in the root class
        const metaParent = parentBehavior === instCls ? Class : parentBehavior.$;
        metacls.parentBehavior = metaParent;
        metaParent.childBehaviors.push(metacls);
      });
      // initialize behavior package (either ClassPackage or MetaclassPackage)
      function addBehaviorPackage(behavior, packageClass) {
        const behaviorPackage = basicCreate(packageClass);
        behaviorPackage.logicContext = behavior;
        behaviorPackage.logicKey = '_';
        const superPackage = behavior.parentBehavior.behaviorPackage;
        behavior._ = behaviorPackage._ = create(superPackage ? superPackage._ : protoTable);
        behavior.behaviorPackage = behaviorPackage;
      }
      // top-down initialization of metaclass package and behavior flags
      enumerateBehaviors(Class, false, false, metacls => {
        addBehaviorPackage(metacls, MetaclassPackage);
        metacls.behaviorFlags = create(metacls.parentBehavior.behaviorFlags);
      });
      // top-down initialization of class package
      enumerateBehaviors(Class, false, false, metacls => {
        addBehaviorPackage(metacls.logicContext, ClassPackage);
      });
      // find or create namespace for new logic object
      function createHomeContext(keys) {
        let home = Root;
        const n = keys.length - 1;
        for (let i = 0; i < n; ++i) {
          const home_ = home._, key = keys[i];
          home = hasOwnProperty.call(home_, key) ? home_[key] : createNamespace(home, key);
        }
        return home;
      }
      // resolve logic name
      function resolveKeys(relative, keys) {
        const n = keys.length;
        // locate first key, possibly in ancestor namespace
        relative = relative._[keys[0]];
        for (let i = 1; relative && i < n; ++i) {
          // other keys must be owned by namespace
          const key = keys[i], relative_ = relative._;
          relative = relative_ && hasOwnProperty.call(relative_, key) && relative_[key];
        }
        return relative;
      }
      // create new child of parent behavior
      function addChildBehavior(key, parentBehavior, behaviorClass, packageClass) {
        const childBehavior = basicCreate(behaviorClass);
        childBehavior.logicKey = key;
        childBehavior.instancePrototype = create(parentBehavior.instancePrototype);
        childBehavior.parentBehavior = parentBehavior;
        childBehavior.childBehaviors = [];
        childBehavior.behaviorFlags = create(parentBehavior.behaviorFlags);
        addBehaviorPackage(childBehavior, packageClass);
        parentBehavior.childBehaviors.push(childBehavior);
        return childBehavior;
      }
      // create new class/metaclass pair
      function createClassPair(ns, key, superCls) {
        const metacls = addChildBehavior('$', superCls.$, Metaclass, MetaclassPackage);
        const instCls = addChildBehavior(key, superCls, metacls, ClassPackage);
        lockProperty(metacls.instancePrototype, '$', metacls);
        metacls.logicContext = instCls;
        instCls.logicContext = ns;
        return instCls;
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
      }
      // attempt to create class of loader
      function createLoadingClass(loader) {
        const ns = loader.home, superCls = resolveKeys(ns, loader.spec.super);
        if (!superCls) {
          // unable to create class now, but perhaps it's possible later on
          return;
        }
        const instCls = createClassPair(ns, loader.key, superCls);
        ns._[loader.key] = instCls;
        return instCls;
      }
      // execute keywords in class scripts
      function scriptAm(flags) { //jshint validthis:true
        const behaviorFlags = this.$.behaviorFlags;
        for (let key in flags) {
          lockProperty(behaviorFlags, key, !!flags[key]);
        }
      }
      function scriptHave(variables) { //jshint validthis:true
        const behavior = this.$, prototype = behavior.instancePrototype;
        const descriptor = { configurable: false, enumerable: true, writable: true };
        for (let key in variables) {
          descriptor.value = variables[key];
          defineProperty(prototype, key, descriptor);
        }
      }
      function scriptAccess(getters) { //jshint validthis:true
        const behavior = this.$, prototype = behavior.instancePrototype;
        const descriptor = { configurable: true, enumerable: false };
        for (let key in getters) {
          descriptor.get = getters[key];
          defineProperty(prototype, key, descriptor);
        }
      }
      function scriptKnow(knowledge) { //jshint validthis:true
        const behavior = this.$, prototype = behavior.instancePrototype;
        const descriptor = { configurable: true, enumerable: false, writable: false };
        for (let key in knowledge) {
          descriptor.value = knowledge[key];
          defineProperty(prototype, key, descriptor);
        }
      }
      function scriptShare(constants) { //jshint validthis:true
        const fieldConstants = this.$.behaviorPackage._;
        const descriptor = { configurable: false, enumerable: false, writable: false };
        for (let key in constants) {
          descriptor.value = constants[key];
          defineProperty(fieldConstants, key, descriptor);
        }
      }
      const bootSetup = [], scriptSetup = bootSetup.push.bind(bootSetup);
      // create boot module
      const bootKeys = bootModuleName.split('.'), bootKey = bootKeys[bootKeys.length - 1];
      const bootNs = createHomeContext(bootKeys), Boot = bootNs._[bootKey] = basicCreate(Module);
      Boot.logicContext = bootNs;
      Boot.logicKey = bootKey;
      Boot._ = create(protoTable);
      // load class by executing class script
      function loadClass(loader) {
        const instCls = loader.subject, scriptInst = create(instCls._);
        const metacls = instCls.$, scriptMeta = create(protoTable);
        // non-enumerable script keywords remain visible
        lockProperty(scriptInst, '$', instCls);
        lockProperty(scriptMeta, '$', metacls);
        lockProperty(scriptInst, '$super', instCls.parentBehavior.instancePrototype);
        lockProperty(scriptMeta, '$super', metacls.parentBehavior.instancePrototype);
        lockProperty(scriptInst, '_', instCls.logicContext._);
        lockProperty(scriptInst, '$module', Boot);
        // enumerable script keywords are only visible while script is executing
        scriptInst.am = scriptAm;
        scriptInst.have = scriptMeta.have = scriptHave;
        scriptInst.access = scriptMeta.access = scriptAccess;
        scriptInst.know = scriptMeta.know = scriptKnow;
        scriptInst.share = scriptShare;
        scriptInst.setup = scriptSetup;
        const script = loader.spec.script;
        script(freeze(create(scriptInst)), freeze(create(scriptMeta)));
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
        const bootLoading = new Map(), loaders = [];
        // add loaders for classes
        for (let name in bootSpec) {
          if (name) {
            const clsSpec = bootSpec[name];
            const keys = name.split('.'), instCls = resolveKeys(Root, keys);
            if (instCls) {
              bootLoading.set(instCls, new Loader(instCls, clsSpec));
            } else {
              loaders.push(new Loader(keys, clsSpec));
            }
          }
        }
        // create classes until creation is no longer possible
        let loading, limit = loaders.length;
        do {
          loading = 0;
          for (let i = 0; i < limit; ++i) {
            const loader = loaders[i], subject = loader.subject = createLoadingClass(loader);
            if (subject) {
              bootLoading.set(subject, loader);
            } else {
              loaders[loading++] = loader;
            }
          }
        } while (loading < limit && (limit = loading));
        if (loading) {
          throw new Error('unbootable module');
        }
        // run class scripts in breadth-first traversal
        const queue = Class.childBehaviors.slice();
        while (queue.length) {
          const metacls = queue.shift();
          queue.push(...metacls.childBehaviors);
          loadClass(bootLoading.get(metacls.logicContext));
        }
      }
      function unveilObject(object) {
        // copy uninitialized, enumerable instance variable from prototype to ensure ownership
        for (let iv in object) {
          object[iv] = object[iv];
        }
        // seal owned properties and unveil new object
        seal(object).unveil();
      }
      // unveil logic context of boot module
      function unveilContext(context) {
        context.logicModules = new Set([Boot]);
        unveilObject(context);
      }
      // run class scripts, but not the setup routines
      loadClasses();
      // unveil all objects built by boot module so far
      bootNamespaces.forEach(ns => unveilContext(ns));
      enumerateBehaviors(Void, true, false, unveilContext);
      enumerateBehaviors(Class, false, false, metacls => {
        unveilObject(metacls.logicContext.behaviorPackage);
        unveilContext(metacls.behaviorPackage);
      });
      // run setup routines and complete initialization of boot module
      bootSetup.forEach(closure => closure());
      const runtimeBundle = Boot.assetBundle = Std_.Runtime._.Image._.Bundle.create(bundleName);
      Boot.logicConfig = Logic_.Config.create(bootSpec['']);
      unveilContext(Boot);
      Boot.$rt.bootTimestamp = t0;
      Boot.beLoaded(true);
      // load other modules from bundle (sorting ensures child module is created after parent)
      const loaders = Object.keys(moduleSpecs).sort().map(name =>
        runtimeBundle.createModuleLoader(name, moduleSpecs[name])
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
        let retriesLeft = 100;
        const finishModules = () => {
          loadModules();
          if (!loading) {
            return runtimeBundle;
          } else if (--retriesLeft) {
            // 100 stage breaks give parent environment opportunity to register service providers
            return this.$theater.stageBreak().triggers(finishModules);
          } else {
            this.$rt.asap(() => { throw new Error('unbootable runtime'); });
          }
        };
        return finishModules();
      }.play();
    }
  };
}