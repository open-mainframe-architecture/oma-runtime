//@ A module loader runs all scripts of a new module.
'Object'.subclass(I => {
  "use strict";
  I.am({
    Final: true
  });
  I.have({
    //@{Std.Logic.Module} module of this loader
    subjectModule: null,
    //@{object|Std.Table} mapping from class names to class specifications
    moduleSpec: null,
    //@{boolean} true if precondition has been verified, otherwise false
    conditionVerified: false,
    //@{[string]} module names on which class scripts of subject module depend
    dependencyNames: null,
    //@{[Std.Logic.Module]} modules that must be loaded when scripts of this loader run
    moduleDependencies: null,
    //@{[string]} names of required services to run class scripts
    moduleRequirements: null,
    //@{[Std.Runtime.Image.ClassLoader]} class loaders whose scripts run in the same round
    loadingClasses: null,
    //@{[Std.Runtime.Image.ClassLoader]} loaders of classes that have been created
    newLoaders: null,
    //@{[function]} setup routines
    moduleSetup: null
  });
  const ClassLoader = I._.ClassLoader, Root = I._.Root, Namespace = I._.Logic._.Namespace;
  I.know({
    //@param module {Std.Logic.Module} subject module
    //@param spec {Std.Table} class specifications
    build: function(module, spec) {
      I.$super.build.call(this);
      this.subjectModule = module;
      this.moduleSpec = spec;
    },
    unveil: function() {
      I.$super.unveil.call(this);
      this.newLoaders = [];
      this.moduleSetup = [];
    },
    //@ Add loaders for nested classes in current round of this module loader.
    //@param instCls {Std.Logic.Class} outer class
    //@param nestedSpecs {object|Std.Table} nested class specifications
    //@return nothing
    addNestedLoaders: function(instCls, nestedSpecs) {
      const loadingClasses = this.loadingClasses;
      const namespace = instCls.getNamespace(), home = instCls.$.getPackage();
      for (let key in nestedSpecs) {
        loadingClasses.push(ClassLoader.create(this, namespace, home, key, nestedSpecs[key]));
      }
    },
    //@ Add a new class to this module loader.
    //@param loader {Std.Runtime.Image.ClassLoader} class loader of new class
    //@param superCls {Std.Logic.Class} superclass of new class
    //@param container {Std.Logic.Namespace|Std.Logic.MetaclassPackage} container of new class
    //@param key {string} unique key of subclass
    //@param constructor {function?} existing constructor or nothing
    //@return {Std.Logic.Class} new class
    addNewClass: function(loader, superCls, container, key, constructor) {
      const newCls = superCls.subclass(container, key, this.subjectModule, constructor);
      this.newLoaders.push(loader);
      return newCls;
    },
    //@ Schedule code to run when this module loader has unveiled new classes.
    //@param closure {function} setup routine
    //@return nothing
    addSetupRoutine: function(closure) {
      this.moduleSetup.push(closure);
    },
    //@ Create initial class loaders for first round of this module loader.
    //@return {[Std.Runtime.Image.ClassLoader]} class loaders
    createFirstLoaders: function() {
      const loaders = [], module = this.subjectModule, spec = this.moduleSpec;
      // if necessary, create ancestor namespace for new class
      const createAncestor = (home, key) => Namespace.create(home, key, module);
      for (let name in spec) {
        if (name) {
          const keys = name.split('.'), key = keys.pop();
          const namespace = Root.makeContainers(keys, createAncestor);
          loaders.push(ClassLoader.create(this, namespace, namespace, key, spec[name]));
        }
      }
      return loaders;
    },
    //@ Get module dependencies or nothing if dependencies cannot yet be resolved.
    //@return {[Std.Logic.Module]?} modules on which the class scripts depend or nothing
    getClassDependencies: function() {
      if (this.moduleDependencies) {
        return this.moduleDependencies;
      }
      const modules = this.getClassDependencyNames().map(I.resolveLogicName);
      if (modules.every(I.isDefined)) {
        // add implicit dependency on first ancestor module
        let ancestor = this.subjectModule.getContext();
        if (ancestor.isModule()) {
          modules.push(ancestor);
        }
        this.moduleDependencies = modules;
        return modules;
      }
    },
    //@ Get names of modules on which the class scripts of subject module depend.
    //@return {[string]} module names
    getClassDependencyNames: function() {
      if (this.dependencyNames) {
        return this.dependencyNames;
      }
      const names = new Set(), addName = names.add, spec = this.moduleSpec;
      for (let name in spec) {
        if (name && spec[name].depends) {
          spec[name].depends.forEach(addName, names);
        }
      }
      this.dependencyNames = [...names];
      return this.dependencyNames;
    },
    //@ Get names of services which the class scripts of subject module require.
    //@return {[string]} service names
    getClassRequirements: function() {
      if (this.moduleRequirements) {
        return this.moduleRequirements;
      }
      const requirements = new Set(), spec = this.moduleSpec;
      for (let name in spec) {
        if (name) {
          const requires = spec[name].requires;
          for (let id in requires) {
            requirements.add(requires[id]);
          }
        }
      }
      this.moduleRequirements = [...requirements];
      return this.moduleRequirements;
    },
    //@ Get module subject.
    //@return {Std.Logic.Module} module
    getModule: function() {
      return this.subjectModule;
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
      const dependencies = this.getClassDependencies();
      if (!dependencies) {
        // wait for creation of more modules
        return false;
      }
      if (!dependencies.every(module => module.isLoaded())) {
        if (dependencies.some(module => module.isUnloadable())) {
          // module is unloadable when some dependency is unloadable
          subject.beLoaded(false);
          return true;
        }
        else {
          // wait for other modules to load first
          return false;
        }
      }
      // ready when all requirements are satisfied, otherwise wait for future satisfaction
      return this.getClassRequirements().every(service => !!this.$rt.provide(service));
    },
    //@ Run class scripts in one or more rounds to load class definitions/refinements.
    //@return nothing
    loadClasses: function() {
      // start with class loaders for the first round
      this.loadingClasses = this.createFirstLoaders();
      // hoist closures out of loop
      const cannotCreate = loader => loader.hasClass() || !loader.hasFinishedCreation();
      const hasClass = loader => loader.hasClass();
      const compareDepth = (left, right) => left.getClassDepth() - right.getClassDepth();
      const loadClass = loader => loader.loadClass();
      while (this.loadingClasses.length) {
        const round = this.loadingClasses;
        // create classes for loaders of this round until creation is no longer possible
        while (!round.every(cannotCreate)) { }
        // fail if one of the loaders could not create its class
        I.failUnless('unloadable module', round.every(hasClass));
        // advance to next round by resetting class loaders of current round
        this.loadingClasses = [];
        // execute scripts to define/refine classes (loaders of nested classes run in next round)
        round.sort(compareDepth).forEach(loadClass);
      }
      // unveil new classes (parent behavior must be unveiled before children are unveiled)
      this.newLoaders.sort(compareDepth).forEach(loader => {
        const instCls = loader.getClass();
        instCls.unveil();
        instCls.$.unveil();
      });
      // run setup routines of class scripts
      this.moduleSetup.forEach(closure => closure());
      this.loadingClasses = this.newLoaders = this.moduleSetup = null;
    },
    //@ Load module when this loader is ready.
    //@return nothing
    loadModule: function() {
      const subject = this.subjectModule;
      if (subject.isLoading()) {
        this.loadClasses();
        // register configured service providers after all classes have been loaded
        const config = subject.getConfig(), providers = config.provides;
        const satisfactions = this.$rt.satisfy(config.requires);
        for (let serviceProvider in providers) {
          const factory = providers[serviceProvider], namePair = serviceProvider.split(' with ');
          const serviceName = namePair[0], providerName = namePair[1] || serviceName;
          const providerClass = this.$rt.resolveService(providerName);
          if (!providerClass) {
            I.fail(`bad provider ${providerName}`);
          }
          const serviceClass = this.$rt.resolveService(serviceName);
          if (!serviceClass) {
            I.fail(`bad service ${serviceName}`);
          }
          const provider = factory(providerClass, satisfactions);
          // skip registration if factory returns nothing
          if (provider) {
            this.$rt.register(serviceClass, provider);
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
      const subject = this.subjectModule, ancestor = subject.getContext();
      if (ancestor.isModule()) {
        if (ancestor.isUnloadable()) {
          // module is unloadable if ancestor is unloadable
          return false;
        }
        if (ancestor.isLoading()) {
          // wait for ancestor to load
          return null;
        }
        // else ancestor has been loaded
      }
      const config = subject.getConfig(), modules = config.depends.map(I.resolveLogicName);
      if (!modules.every(I.isDefined)) {
        // wait for modules to be created
        return null;
      }
      if (modules.some(module => module.isUnloadable())) {
        // module is unloadable if some explicit dependency is unloadable
        return false;
      }
      if (modules.some(module => module.isLoading())) {
        // wait for dependency to load
        return null;
      }
      // are required services provided?
      const requires = config.requires;
      if (Object.keys(requires).every(id => !!this.$rt.provide(requires[id]))) {
        const precondition = config.test;
        // module is unloadable if precondition test fails, otherwise configuration passed test
        return precondition(this.$rt.satisfy(requires)) !== false;
      }
      // wait for required services to be provided
      return null;
    }
  });
})