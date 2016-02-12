//@ A module loader runs all scripts of a new module.
'Std.BaseObject'.subclass(function (I) {
  "use strict";
  I.have({
    //@{Std.Logic.Module} module that this loader has created
    subjectModule: null,
    //@{Rt.Table} mapping from class names to class specifications
    moduleSpec_: null,
    //@{[string]} module names on which subject module depends
    dependencyNames: null,
    //@{[Std.Logic.Module]} modules that must be loaded when scripts of this loader run
    moduleDependencies: null,
    //@{[string]} names of required services
    moduleRequirements: null,
    //@{[Rt.Image.ClassLoader]} class loaders whose scripts run in the same round
    loadingClasses: null,
    //@{[Std.Logic.Class]} new classes that have been created by this loader
    newClasses: null,
    //@{[Rt.Closure]} setup routines
    moduleSetup: null
  });
  I.know({
    //@param bundle {Rt.Image.Bundle} bundle that distributes new module
    //@param name {string?} module name or empty for anonymous module
    //@param spec_ {Rt.Table} class specifications
    build: function (bundle, name, spec_) {
      I.$super.build.call(this);
      if (name) {
        // create module with given name
        this.subjectModule = I._.Std._.Logic._.Module.create(name, null, bundle, spec_['']);
      } else {
        // create anonymous module with bundle specification below boot module
        var home = I.$module;
        var key = bundle.getName();
        this.subjectModule = I._.Std._.Logic._.Module.create(home, key, bundle, spec_['']);
      }
      this.moduleSpec_ = spec_;
    },
    unveil: function () {
      I.$super.unveil.call(this);
      this.newClasses = [];
      this.moduleSetup = [];
    },
    //@ Add new class loader in current round of this module loader.
    //@param module {Std.Logic.Module} module of class definition/refinement
    //@param namespace {Std.Logic.Namespace} namespace where class lives
    //@param spec {Object} class specification
    //@param instCls {Std.Logic.Class} class subject of new loader
    //@return {Rt.Image.ClassLoader} new class loader
    addClassLoader: function (module, namespace, spec, instCls) {
      var home = instCls.getContext();
      var key = instCls.getKey();
      var loader = I._.ClassLoader.create(this, module, namespace, home, key, spec, instCls);
      this.loadingClasses.push(loader);
      return loader;
    },
    //@ If required, add new loader for mixed-in class in current round of this module loader.
    //@param superCls {Std.Logic.Class} superclass of mixed-in class
    //@param mixin {Std.Logic.Class} class mixin to add to super
    //@return {Std.Logic.Class} existing or new mixed-in class
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
    //@ Add loaders for nested classes in current round of this module loader.
    //@param module {Std.Logic.Module} module with definition/refinment of outer class
    //@param namespace {Std.Logic.Namespace} namespace of nested classes
    //@param instCls {Std.Logic.Namespace} outer class
    //@param nestedSpecs_ {Rt.Table} map keys of nested classes to class specifications
    //@return nothing
    addNestedLoaders: function (module, namespace, instCls, nestedSpecs_) {
      var home = instCls.$.getPackage(), loadingClasses = this.loadingClasses;
      for (var key in nestedSpecs_) {
        // look up existing nested class (metaclass package contains package alias, not the class)
        var nestCls = instCls.getPackage().lookup(key);
        var spec = nestedSpecs_[key];
        var loader = I._.ClassLoader.create(this, module, namespace, home, key, spec, nestCls);
        loadingClasses.push(loader);
      }
    },
    //@ Schedule code to run when this module loader has unveiled new classes.
    //@param closure {Rt.Closure} setup routine
    //@return nothing
    addSetupRoutine: function (closure) {
      this.moduleSetup.push(closure);
    },
    //@ Add new subclass to this module loader.
    //@param module {Std.Logic.Module} module of new class
    //@param superCls {Std.Logic.Class} superclass of new class
    //@param context {Std.Logic.Namespace|Std.Logic.MetaclassPackage} context of new class
    //@param key {string} unique key of subclass
    //@param legacyConstructor {Rt.Closure?} existing constructor or nothing
    //@return {Std.Logic.Class} new class
    addSubclass: function (module, superCls, context, key, legacyConstructor) {
      var newCls = superCls.subclass(context, key, module, legacyConstructor);
      this.newClasses.push(newCls);
      return newCls;
    },
    //@ Create initial class loaders for first round of this module loader.
    //@return {[Rt.Image.ClassLoader]} class loaders
    createLoaders: function () {
      var loaders = [], module = this.subjectModule, spec_ = this.moduleSpec_;
      var Namespace = I._.Std._.Logic._.Namespace;
      // if necessary, create namespace for new class
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
    //@ Get module dependencies or nothing if dependencies cannot yet be resolved.
    //@return {[Std.Logic.Module]?} module on which the module subject depends or nothing
    //@except when specified dependency names are not module names
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
    //@ Get names of modules on which the subject module depends.
    //@return {[string]} module names
    getDependencyNames: function () {
      if (this.dependencyNames) {
        return this.dependencyNames;
      }
      var accu_ = {}, spec_ = this.moduleSpec_;
      var addDependency = function (dependency) { accu_[dependency] = true; };
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
    //@ Get module subject.
    //@return {Std.Logic.Module} module
    getModule: function () {
      return this.subjectModule;
    },
    //@ Get names of required services.
    //@return {[string]} service names
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
    //@ Test whether this loader is ready to load the subject.
    //@return {boolean} true when module is ready to be loaded, otherwise false
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
    //@ Run class scripts in one or more rounds to load class definitions/refinements.
    //@return nothing
    //@except when this loader is already loading classes
    //@except when the class of a class loader cannot be created
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
    //@ When this loader is ready, either load module subject or mark it permanently unloadable.
    //@return nothing
    //@except when module subject is not loading classes anymore
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