'Std.BaseObject'.subclass(function (I) {
  "use strict";
  // I describe a loader that runs all scripts of a new module.
  I.have({
    // module that this loader has created
    subjectModule: null,
    // table with class specifications
    moduleSpec_: null,
    // list with module names on which subject module depends
    dependencyNames: null,
    // array with modules that must be loaded when scripts of this loader run
    moduleDependencies: null,
    // array with names of required services
    moduleRequirements: null,
    // array with class loaders whose scripts run in the same round
    loadingClasses: null,
    // array with new classes that have been created by this loader
    newClasses: null,
    // array with setup routines
    moduleSetup: null
  });
  I.know({
    build: function (bundle, name, spec_) {
      I.$super.build.call(this);
      if (name) {
        // create module with given name
        this.subjectModule = I._.Std._.Logic._.Module.create(name, null, bundle, spec_['']);
      } else {
        // create anonymous module with bundle specification below boot module
        var home = I.$module;
        var key = bundle.getId();
        this.subjectModule = I._.Std._.Logic._.Module.create(home, key, bundle, spec_['']);
      }
      this.moduleSpec_ = spec_;
    },
    unveil: function () {
      I.$super.unveil.call(this);
      this.newClasses = [];
      this.moduleSetup = [];
    },
    // add new class loader in current round of this module loader
    addClassLoader: function (module, namespace, spec, instCls) {
      var home = instCls.getContext();
      var key = instCls.getKey();
      var loader = I._.ClassLoader.create(this, module, namespace, home, key, spec, instCls);
      this.loadingClasses.push(loader);
      return loader;
    },
    // if required, add new loader for mixed-in class in current round of this module loader
    addMixin: function (superCls, mixin) {
      var instCls = mixin.getMixedClass(superCls);
      if (instCls) {
        // mixed-in class already exists
        return instCls;
      }
      var parentMixin = mixin.getParentBehavior();
      superCls = this.addMixin(superCls, parentMixin);
      if (mixin.getTraitBehavior()) {
        return this.addMixin(superCls, mixin.getTraitBehavior());
      }
      var home = superCls.getContext();
      var key = superCls.getMixedBase(parentMixin).getKey() + '+' + mixin.getName();
      var newCls = this.addSubclass(mixin.getModule(), superCls, home, key);
      var namespace = mixin.getNamespace();
      var self = this, loadingClasses = this.loadingClasses;
      mixin.addMixedClass(newCls);
      // run defining and refining scripts of mixin against the mixed-in class
      mixin.enumerateSpecs(function (spec, module) {
        var loader = I._.ClassLoader.create(self, module, namespace, home, key, spec, newCls);
        loadingClasses.push(loader);
      });
      return newCls;
    },
    // add loaders for nested classes in current round of this module loader
    addNestedLoaders: function (module, namespace, instCls, nestedSpecs_) {
      var home = instCls.$.getPackage(), loadingClasses = this.loadingClasses;
      for (var key in nestedSpecs_) {
        // lookup existing nested class, if any
        var nestCls = instCls.getPackage().lookup(key);
        var spec = nestedSpecs_[key];
        var loader = I._.ClassLoader.create(this, module, namespace, home, key, spec, nestCls);
        loadingClasses.push(loader);
      }
    },
    addSetupRoutine: function (closure) {
      this.moduleSetup.push(closure);
    },
    addSubclass: function (module, superCls, context, key, legacyConstructor) {
      var newCls = superCls.subclass(context, key, module, legacyConstructor);
      this.newClasses.push(newCls);
      return newCls;
    },
    // create initial class loaders for first round of this module loader
    createLoaders: function () {
      var loaders = [], module = this.subjectModule, spec_ = this.moduleSpec_;
      var Namespace = I._.Std._.Logic._.Namespace;
      function createAncestor(home, key) {
        return Namespace.create(home, key, module);
      }
      for (var name in spec_) {
        if (name) {
          var keys = name.split('.'), key = keys.pop();
          var ns = I._.Root.makeContexts(keys, createAncestor);
          if (!Namespace.describes(ns)) {
            this.bad('class', name);
          }
          loaders.push(I._.ClassLoader.create(this, module, ns, ns, key, spec_[name]));
        }
      }
      return loaders;
    },
    // module dependencies or undefined if dependencies cannot be resolved
    getDependencies: function () {
      if (this.moduleDependencies) {
        return this.moduleDependencies;
      }
      var modules = [];
      this.getDependencyNames().forEach(function (name) { modules.push(I._.Root.resolve(name)); });
      if (modules.every(I.isDefined)) {
        // if all names resolves to logicals, the logicals must be modules
        var isModule = I._.Std._.Logic._.Module.describes.bind(I._.Std._.Logic._.Module);
        if (!modules.every(isModule)) {
          this.bad('dependencies');
        }
        // add implicit dependencies on ancestor modules
        var ancestor = this.subjectModule;
        while (isModule(ancestor = ancestor.getContext())) {
          modules.push(ancestor);
        }
        this.moduleDependencies = modules;
        return modules;
      }
    },
    // names of modules on which the subject module depends
    getDependencyNames: function () {
      if (this.dependencyNames) {
        return this.dependencyNames;
      }
      var addDependency = function (dependency) { accu_[dependency] = true; };
      var accu_ = {}, spec_ = this.moduleSpec_;
      for (var name in spec_) {
        if (name) {
          var depends = spec_[name].depends;
          if (depends) {
            depends.forEach(addDependency);
          }
        }
      }
      this.subjectModule.getConfig().depends.forEach(addDependency);
      this.dependencyNames = Object.keys(accu_);
      return this.dependencyNames;
    },
    getModule: function () {
      return this.subjectModule;
    },
    // get names of required services
    getRequirements: function () {
      var requirements = this.moduleRequirements;
      if (requirements) {
        return requirements;
      }
      var id, accu_ = {}, spec_ = this.moduleSpec_;
      for (var name in spec_) {
        if (name) {
          var classRequires_ = spec_[name].requires;
          for (id in classRequires_) {
            accu_[classRequires_[id]] = true;
          }
        }
      }
      var moduleRequires_ = this.subjectModule.getConfig().requires;
      for (id in moduleRequires_) {
        accu_[moduleRequires_[id]] = true;
      }
      this.moduleRequirements = Object.keys(accu_);
      return this.moduleRequirements;
    },
    isReady: function () {
      if (!this.subjectModule.isLoading()) {
        // if subject module is not loading, this loader is not ready anymore
        return false;
      }
      var dependencies = this.getDependencies();
      if (!dependencies) {
        // wait for creation of more modules
        return false;
      }
      if (!dependencies.every(function (module) { return module.isLoaded(); })) {
        if (dependencies.every(function (module) { return !module.isUnloadable(); })) {
          // wait for other modules to load first
          return false;
        }
        else {
          // this loader is ready when some dependency is unloadable
          return true;
        }
      }
      var rt = this.$rt;
      // ready when all requirements are satisfied, otherwise wait for future satisfaction
      return this.getRequirements().every(function (service) { return rt.provides(service); });
    },
    loadClasses: function () {
      if (this.loadingClasses) {
        this.bad();
      }
      // start with class loaders for the first round
      this.loadingClasses = this.createLoaders();
      // hoist closures out of loop
      function cannotCreate(loader) { return loader.hasClass() || !loader.finishCreation(); }
      function hasClass(loader) { return loader.hasClass(); }
      function compareDepth(left, right) {
        return left.getInheritanceDepth() - right.getInheritanceDepth();
      }
      function prepareLoad(loader) { loader.prepareLoad(); }
      function loadClass(loader) { loader.loadClass(); }
      while (this.loadingClasses.length) {
        var round = this.loadingClasses;
        // create classes for loaders of this round until creation is no longer possible
        while (!round.every(cannotCreate)) { }
        // fail if a loader cannot create its class
        if (!round.every(hasClass)) {
          this.bad('classes');
        }
        // prepare class script execution (new class loaders will run in this round)
        round.sort(compareDepth).forEach(prepareLoad);
        // advance to next round by resetting class loaders of current round
        this.loadingClasses = [];
        // execute scripts to define/refine classes (new class loaders will run in next round)
        round.forEach(loadClass);
      }
      // unveil new classes (parent behavior must be unveiled before children are unveiled)
      this.newClasses.sort(compareDepth).forEach(function (instCls) {
        instCls.unveil();
        instCls.$.unveil();
      });
      // run setup routines of class scripts
      this.moduleSetup.forEach(function (closure) { closure(); });
      this.loadingClasses = this.newClasses = this.moduleSetup = null;
    },
    // when this loader is ready, either load module or mark module as permanently unloadable
    loadModule: function () {
      var subject = this.subjectModule;
      if (!subject.isLoading()) {
        // cannot load module twice
        this.bad();
      }
      if (this.getDependencies().some(function (module) { return module.isUnloadable(); })) {
        // subject module is unloadable when some dependency is unloadable
        subject.beLoaded(false);
      } else {
        var rt = this.$rt, config = subject.getConfig();
        var satisfactions = rt.satisfy(config.requires);
        var precondition = config.test;
        // precondition code returns false to abort load
        if (precondition(satisfactions) === false) {
          subject.beLoaded(false);
        } else {
          // run class scripts when all lights are green
          this.loadClasses();
          // register configured service providers after all classes have been loaded
          var providers = config.provides, resolveService = I._.System._.resolveService;
          for (var serviceName in providers) {
            var serviceClass = resolveService(serviceName) || this.bad(serviceName);
            var factory = providers[serviceName];
            var provider = factory.call(subject, serviceClass, satisfactions);
            if (provider) {
              rt.register(provider);
            }
          }
          // last step installs subject module
          config.installModule(subject);
          subject.beLoaded(true);
        }
      }
    }
  });
})