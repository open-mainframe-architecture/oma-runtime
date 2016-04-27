//@ A module loader runs all scripts of a new module.
'BaseObject'.subclass(I => {
  "use strict";
  const ClassLoader = I._.ClassLoader, Root = I._.Root, System = I._.System;
  const Module = I._.Logic._.Module, Namespace = I._.Logic._.Namespace;
  I.have({
    //@{Std.Logic.Module} module that this loader has created
    subjectModule: null,
    //@{Std.Table} mapping from class names to class specifications
    moduleSpec_: null,
    //@{boolean} true if precondition has been verified, otherwise false
    conditionVerified: false,
    //@{[string]} module names on which subject module depends
    dependencyNames: null,
    //@{[Std.Logic.Module]} modules that must be loaded when scripts of this loader run
    moduleDependencies: null,
    //@{[string]} names of required services
    moduleRequirements: null,
    //@{[Std.Runtime.Image.ClassLoader]} class loaders whose scripts run in the same round
    loadingClasses: null,
    //@{[Std.Logic.Class]} new classes that have been created by this loader
    newClasses: null,
    //@{[Std.Closure]} setup routines
    moduleSetup: null
  });
  I.know({
    //@param bundle {Std.Runtime.Image.Bundle} bundle that distributes new module
    //@param name {string?} module name or empty for anonymous module
    //@param spec_ {Std.Table} class specifications
    build: function(bundle, name, spec_) {
      I.$super.build.call(this);
      if (name) {
        // create module with given name
        this.subjectModule = Module.create(name, null, bundle, spec_['']);
      } else {
        // create anonymous module with bundle specification below boot module
        this.subjectModule = Module.create(I.$module, bundle.getName(), bundle, spec_['']);
      }
      this.moduleSpec_ = spec_;
    },
    unveil: function() {
      I.$super.unveil.call(this);
      this.newClasses = [];
      this.moduleSetup = [];
    },
    //@ Add new class loader in current round of this module loader.
    //@param module {Std.Logic.Module} module of class definition/refinement
    //@param namespace {Std.Logic.Namespace} namespace where class lives
    //@param spec {Object} class specification
    //@param instCls {Std.Logic.Class} class subject of new loader
    //@return {Std.Runtime.Image.ClassLoader} new class loader
    addClassLoader: function(module, namespace, spec, instCls) {
      const home = instCls.getContext(), key = instCls.getKey();
      const loader = ClassLoader.create(this, module, namespace, home, key, spec, instCls);
      this.loadingClasses.push(loader);
      return loader;
    },
    //@ If required, add new loader for mixed-in class in current round of this module loader.
    //@param superCls {Std.Logic.Class} superclass of mixed-in class
    //@param mixin {Std.Logic.Class} class mixin to add to super
    //@return {Std.Logic.Class} existing or new mixed-in class
    addMixin: function(superCls, mixin) {
      const instCls = mixin.getMixedClass(superCls);
      if (instCls) {
        // mixed-in class already exists
        return instCls;
      }
      const parentMixin = mixin.getParentBehavior();
      superCls = this.addMixin(superCls, parentMixin);
      if (mixin.getTraitBehavior()) {
        return this.addMixin(superCls, mixin.getTraitBehavior());
      }
      const home = superCls.getContext();
      const key = `${superCls.getMixedBase(parentMixin).getKey()}+${mixin.getName()}`;
      const newCls = this.addSubclass(mixin.getModule(), superCls, home, key);
      mixin.addMixedClass(newCls);
      const namespace = mixin.getNamespace(), loadingClasses = this.loadingClasses;
      // run defining and refining scripts of mixin against the mixed-in class
      mixin.enumerateSpecs((spec, module) => {
        loadingClasses.push(ClassLoader.create(this, module, namespace, home, key, spec, newCls));
      });
      return newCls;
    },
    //@ Add loaders for nested classes in current round of this module loader.
    //@param module {Std.Logic.Module} module with definition/refinment of outer class
    //@param namespace {Std.Logic.Namespace} namespace of nested classes
    //@param instCls {Std.Logic.Namespace} outer class
    //@param nestedSpecs_ {Std.Table} map keys of nested classes to class specifications
    //@return nothing
    addNestedLoaders: function(module, namespace, instCls, nestedSpecs_) {
      const home = instCls.$.getPackage(), loadingClasses = this.loadingClasses;
      for (let key in nestedSpecs_) {
        // look up existing nested class (metaclass package contains package alias, not the class)
        const nestCls = instCls.getPackage().lookup(key), spec = nestedSpecs_[key];
        loadingClasses.push(ClassLoader.create(this, module, namespace, home, key, spec, nestCls));
      }
    },
    //@ Schedule code to run when this module loader has unveiled new classes.
    //@param closure {Std.Closure} setup routine
    //@return nothing
    addSetupRoutine: function(closure) {
      this.moduleSetup.push(closure);
    },
    //@ Add new subclass to this module loader.
    //@param module {Std.Logic.Module} module of new class
    //@param superCls {Std.Logic.Class} superclass of new class
    //@param context {Std.Logic.Namespace|Std.Logic.MetaclassPackage} context of new class
    //@param key {string} unique key of subclass
    //@param legacyConstructor {Std.Closure?} existing constructor or nothing
    //@return {Std.Logic.Class} new class
    addSubclass: function(module, superCls, context, key, legacyConstructor) {
      const newCls = superCls.subclass(context, key, module, legacyConstructor);
      this.newClasses.push(newCls);
      return newCls;
    },
    //@ Create initial class loaders for first round of this module loader.
    //@return {[Std.Runtime.Image.ClassLoader]} class loaders
    createLoaders: function() {
      const loaders = [], module = this.subjectModule, spec_ = this.moduleSpec_;
      // if necessary, create namespace for new class
      const createAncestor = (home, key) => Namespace.create(home, key, module);
      for (let name in spec_) {
        if (name) {
          const keys = name.split('.'), key = keys.pop();
          const namespace = Root.makeContexts(keys, createAncestor);
          this.assert(Namespace.describes(namespace));
          loaders.push(ClassLoader.create(this, module, namespace, namespace, key, spec_[name]));
        }
      }
      return loaders;
    },
    //@ Get module dependencies or nothing if dependencies cannot yet be resolved.
    //@return {[Std.Logic.Module]?} modules on which the module subject depends or nothing
    //@except when specified dependency names are not module names
    getDependencies: function() {
      if (this.moduleDependencies) {
        return this.moduleDependencies;
      }
      const modules = this.getDependencyNames().map(I.resolveLogical);
      if (modules.every(I.isDefined)) {
        // if all names resolves to logicals, the logicals must be modules
        this.assert(modules.every(isModule));
        // add implicit dependencies on ancestor modules
        let ancestor = this.subjectModule;
        while (isModule(ancestor = ancestor.getContext())) {
          modules.push(ancestor);
        }
        this.moduleDependencies = modules;
        return modules;
      }
    },
    //@ Get names of modules on which the class scripts of subject module depends.
    //@return {[string]} module names
    getDependencyNames: function() {
      if (this.dependencyNames) {
        return this.dependencyNames;
      }
      const accu_ = {}, spec_ = this.moduleSpec_;
      for (let name in spec_) {
        if (name) {
          const depends = spec_[name].depends;
          if (depends) {
            for (let dependency of depends) {
              accu_[dependency] = true;
            }
          }
        }
      }
      this.dependencyNames = Object.keys(accu_);
      return this.dependencyNames;
    },
    //@ Get module subject.
    //@return {Std.Logic.Module} module
    getModule: function() {
      return this.subjectModule;
    },
    //@ Get names of services which the class scripts of subject module require.
    //@return {[string]} service names
    getRequirements: function() {
      const requirements = this.moduleRequirements;
      if (requirements) {
        return requirements;
      }
      const accu_ = {}, spec_ = this.moduleSpec_;
      for (let name in spec_) {
        if (name) {
          const requires_ = spec_[name].requires;
          for (let id in requires_) {
            accu_[requires_[id]] = true;
          }
        }
      }
      this.moduleRequirements = Object.keys(accu_);
      return this.moduleRequirements;
    },
    //@ Test whether this loader is ready to load the subject.
    //@return {boolean} true when module is ready to be loaded, otherwise false
    isReady: function() {
      const subject = this.subjectModule;
      if (!subject.isLoading()) {
        // if subject module is not loading, this loader is not ready anymore
        return false;
      }
      // hasn't the configured precondition been verified to be true?
      if (!this.conditionVerified) {
        const passed = this.testCondition();
        if (passed === null) {
          // condition test is not yet decisive
          return false;
        }
        if (!passed) {
          // module is unloadable if precondition failed
          subject.beLoaded(false);
          return true;
        }
        // precondition has been verified to be true
        this.conditionVerified = true;
      }
      // process dependencies and requirements from class scripts after precondition test
      const dependencies = this.getDependencies();
      if (!dependencies) {
        // wait for creation of more modules
        return false;
      }
      if (!dependencies.every(isLoaded)) {
        if (dependencies.some(isUnloadable)) {
          // module is unloadable when some dependency is unloadable
          subject.beLoaded(false);
          return true;
        }
        else {
          // wait for other modules to load first
          return false;
        }
      }
      const runtime = this.$rt;
      // ready when all requirements are satisfied, otherwise wait for future satisfaction
      return this.getRequirements().every(service => runtime.provides(service));
    },
    //@ Run class scripts in one or more rounds to load class definitions/refinements.
    //@return nothing
    //@except when this loader is already loading classes
    //@except when the class of a class loader cannot be created
    loadClasses: function() {
      this.assert(!this.loadingClasses);
      // start with class loaders for the first round
      this.loadingClasses = this.createLoaders();
      while (this.loadingClasses.length) {
        const round = this.loadingClasses;
        // create classes for loaders of this round until creation is no longer possible
        while (!round.every(cannotCreate)) { }
        // fail if a loader cannot create its class
        this.assert(round.every(hasClass));
        // prepare class script execution (new class loaders will run in this round)
        for (let loader of round.sort(compareDepth)) {
          loader.prepareLoad();
        }
        // advance to next round by resetting class loaders of current round
        this.loadingClasses = [];
        // execute scripts to define/refine classes (new class loaders will run in next round)
        for (let loader of round) {
          loader.loadClass();
        }
      }
      // unveil new classes (parent behavior must be unveiled before children are unveiled)
      for (let instCls of this.newClasses.sort(compareDepth)) {
        instCls.unveil();
        instCls.$.unveil();
      }
      // run setup routines of class scripts
      for (let closure of this.moduleSetup) {
        closure();
      }
      this.loadingClasses = this.newClasses = this.moduleSetup = null;
    },
    //@ Load module when this loader is ready.
    //@return nothing
    //@except when module subject is not loading classes anymore
    loadModule: function() {
      const subject = this.subjectModule;
      if (subject.isLoading()) {
        this.loadClasses();
        // register configured service providers after all classes have been loaded
        const config = subject.getConfig(), providers = config.provides;
        if (I.hasEnumerables(providers)) {
          const runtime = this.$rt, resolveService = System._.resolveService;
          const satisfactions = runtime.satisfy(config.requires);
          for (let serviceName in providers) {
            const serviceClass = resolveService(serviceName);
            this.assert(serviceClass);
            const factory = providers[serviceName];
            const provider = factory(serviceClass, satisfactions);
            // skip registration if factory returns nothing
            if (provider) {
              runtime.register(provider);
            }
          }
        }
        // last step installs subject module
        config.installModule(subject);
        subject.beLoaded(true);
      }
    },
    //@ Test configured precondition before class scripts are processed.
    //@return {boolean?} true if module passed test, false if it failed, nothing if indecisive
    testCondition: function() {
      const subject = this.subjectModule;
      for (let ancestor = subject; isModule(ancestor = ancestor.getContext());) {
        if (ancestor.isUnloadable()) {
          // module is unloadable if some ancestor is unloadable
          return false;
        }
        if (ancestor.isLoading()) {
          // wait for ancestor to load
          return null;
        }
      }
      const config = subject.getConfig(), modules = config.depends.map(I.resolveLogical);
      if (!modules.every(I.isDefined)) {
        // wait for modules to be created
        return null;
      }
      this.assert(modules.every(isModule));
      if (modules.some(isUnloadable)) {
        // module is unloadable if some explicit dependency is unloadable
        return false;
      }
      if (modules.some(isLoading)) {
        // wait for dependency to load
        return null;
      }
      // are required services provided?
      const runtime = this.$rt, requires_ = config.requires;
      if (Object.keys(requires_).every(id => runtime.provides(requires_[id]))) {
        const precondition = config.test;
        // module is unloadable if precondition test fails, otherwise configuration passed test
        return precondition(runtime.satisfy(requires_)) !== false;
      }
      // wait for required services to be provided
      return null;
    }
  });
  // hoist closures
  function isModule(it) { return Module.describes(it); }
  function isUnloadable(module) { return module.isUnloadable(); }
  function isLoaded(module) { return module.isLoaded(); }
  function isLoading(module) { return module.isLoading(); }
  function cannotCreate(loader) { return loader.hasClass() || !loader.finishCreation(); }
  function hasClass(loader) { return loader.hasClass(); }
  function compareDepth(l, r) { return l.getInheritanceDepth() - r.getInheritanceDepth(); }
})