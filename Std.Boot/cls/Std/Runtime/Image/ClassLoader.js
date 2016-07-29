//@ A class loader defines or redefines a class.
'Object'.subclass(I => {
  "use strict";
  I.am({
    Final: true
  });
  I.have({
    //@{Std.Runtime.Image.ModuleLoader} module loader that created this class loader
    moduleLoader: null,
    //@{Std.Logic.Namespace} namespace where resolution of logic names in class scripts starts
    classNamespace: null,
    //@{Std.Logic.Namespace|Std.Logic.MetaclassPackage} container for class of this loader
    classContainer: null,
    //@{string} unique key of class in its container
    classKey: null,
    //@{object} specification with super, script, constructs, requires and depends properties
    classSpec: null,
    //@{Std.Logic.Class} existing or new class of this loader
    classSubject: null,
    //@{integer} nonnegative inheritance depth of class or -1
    classDepth: -1
  });
  I.know({
    //@param loader {Std.Runtime.Image.ModuleLoader} module loader
    //@param namespace {Std.Logic.Namespace} namespace for name resolution in script
    //@param container {Std.Logic.Namespace|Std.Logic.MetaclassPackage} container of class
    //@param key {string} unique key of class
    //@param spec {object} class specification
    build: function(loader, namespace, container, key, spec) {
      I.$super.build.call(this);
      this.moduleLoader = loader;
      this.classNamespace = namespace;
      this.classContainer = container;
      this.classKey = key;
      this.classSpec = spec;
      this.classSubject = container.select(key);
    },
    //@ Obtain class of this loader.
    //@return {Std.Logic.Class} class of this loader
    getClass: function() {
      return this.classSubject;
    },
    //@ Obtain (cached) inheritance depth of class.
    //@return {integer} nonnegative depth
    getClassDepth: function() {
      if (this.classDepth < 0) {
        this.classDepth = this.classSubject.getInheritanceDepth();
      }
      return this.classDepth;
    },
    //@ Obtain module of this class loader.
    //@return {Std.Logic.Module} module
    getModule: function() {
      return this.moduleLoader.getModule();
    },
    //@ Test whether this loader has a class. If not, the loader should create it.
    //@return {boolean} true if loader has a class, otherwise false
    hasClass: function() {
      return !!this.classSubject;
    },
    //@ Attempt to create class of this loader.
    //@return {boolean} true if class was created, otherwise false
    hasFinishedCreation: function() {
      if (!this.classSubject) {
        const namespace = this.classNamespace, spec = this.classSpec;
        const superCls = namespace.resolveKeys(spec.super);
        if (superCls) {
          const container = this.classContainer, key = this.classKey, loader = this.moduleLoader;
          this.classSubject = loader.addNewClass(this, superCls, container, key, spec.constructs);
          // successfully created new class
          return true;
        }
      }
      return false;
    },
    //@ Run class script to define or redefine the class of this loader.
    //@return nothing
    loadClass: function() {
      const instCls = this.classSubject, spec = this.classSpec, script = spec.script || spec;
      const parentBehavior = instCls.getParentBehavior(), module = this.getModule();
      const refinement = instCls.getModule() !== module;
      I.failUnless('final superclass', !parentBehavior.isFinal());
      if (refinement) {
        // metaclass package, metaclass and class are (potentially) refined in module
        instCls.$.getPackage().addModule(module);
        if (spec.super && spec.super[0] !== 'super') {
          // verify superfluous super expression of class refinement
          const superCls = this.classNamespace.resolveKeys(spec.super);
          I.failUnless('bad superclass', superCls === parentBehavior);
        }
      }
      // create I and We script arguments for instance and class side
      const scriptInst = I.createTable(instCls._), scriptMeta = I.createTable();
      // empty property key links script argument in running script back to this class loader
      scriptInst[''] = scriptMeta[''] = this;
      // initialize keywords of script arguments
      this.prepareScript(scriptInst, scriptMeta);
      if (spec.requires) {
        const satisfactions = this.$rt.satisfy(spec.requires);
        for (let serviceKey in satisfactions) {
          if (!I.isPropertyOwner(scriptInst, serviceKey)) {
            // install required service provider if key is not already defined in I argument
            I.lockProperty(scriptInst, serviceKey, satisfactions[serviceKey]);
          }
        }
      }
      script(Object.freeze(I.createTable(scriptInst)), Object.freeze(I.createTable(scriptMeta)));
      // break references to keywords that only made sense during script execution
      for (let keyword in scriptInst) {
        delete scriptInst[keyword];
      }
      for (let keyword in scriptMeta) {
        delete scriptMeta[keyword];
      }
    },
    //@ Prepare script arguments of this loader.
    //@param scriptInst {Std.Table} instance side of class script, usually called I
    //@param scriptMeta {Std.Table} class side of class script, usually called We
    //@return nothing
    prepareScript: function(scriptInst, scriptMeta) {
      const instCls = this.classSubject, module = this.getModule();
      // I.$ for class and We.$ for metaclass
      I.lockProperty(scriptInst, '$', instCls);
      I.lockProperty(scriptMeta, '$', instCls.$);
      // I._ for access to namespace table
      I.lockProperty(scriptInst, '_', this.classNamespace._);
      // I.$module for module that holds script code
      I.lockProperty(scriptInst, '$module', module);
      // I.$super and We.$super for prototypes of superclass and supermetaclass
      I.lockProperty(scriptInst, '$super', instCls.getParentBehavior().getPrototype());
      I.lockProperty(scriptMeta, '$super', instCls.$.getParentBehavior().getPrototype());
      const refinement = instCls.getModule() !== module;
      if (refinement) {
        // I.$former and We.$former for former definitions of refined methods
        I.lockProperty(scriptInst, '$former', I.createTable());
        I.lockProperty(scriptMeta, '$former', I.createTable());
        // I.refine and We.refine for refined instance methods and class instance methods
        scriptInst.refine = scriptMeta.refine = scriptRefine;
      } else {
        // I.have and We.have to specify instance variables and class instance variables
        scriptInst.have = scriptMeta.have = scriptHave;
      }
      if (!refinement || instCls.isRootBehavior()) {
        // I.am to specify flags of new class (or to introduce new flags in root class)
        scriptInst.am = scriptAm;
      }
      // I.access and We.access for instance accessors and class instance accessors
      scriptInst.access = scriptMeta.access = scriptAccess;
      // I.know and We.know for instance methods/constants and class instance methods/constants
      scriptInst.know = scriptMeta.know = scriptKnow;
      // I.share for subroutines and package constants
      scriptInst.share = scriptShare;
      // I.nest for nested classes
      scriptInst.nest = scriptNest;
      // I.setup for a setup routine and for deferred construction of package constants
      scriptInst.setup = scriptSetup;
      // add nonstandard keywords to simplify scripts in particular domain of classes
      instCls.prepareScript(scriptInst, scriptMeta);
    }
  });
  // standard script keywords: am, have, access, know, refine, share, nest and setup
  function scriptAm(flags) { //jshint validthis:true
    this.$.setBehaviorFlags(flags);
  }
  function scriptHave(variables) { //jshint validthis:true
    this.$.addInstanceVariables(variables);
  }
  function scriptAccess(accessors) { //jshint validthis:true
    this.$.addInstanceAccessors(accessors);
  }
  function scriptKnow(knowledge) { //jshint validthis:true
    this.$.addInstanceKnowledge(knowledge);
  }
  function scriptRefine(methods) { //jshint validthis:true
    this.$.refineInstanceMethods(methods, this.$former);
  }
  function scriptShare(constants) { //jshint validthis:true
    this.$.addPackageFields(constants);
  }
  function scriptNest(nestedSpecs) { //jshint validthis:true
    this[''].moduleLoader.addNestedLoaders(this.$, nestedSpecs);
  }
  function scriptSetup(setup) { //jshint validthis:true
    this[''].moduleLoader.addSetupRoutine(I.isClosure(setup) ? setup : () => {
      // add more package constants and subroutines after instance class has been unveiled
      const constants = {};
      for (let key in setup) {
        const factory = setup[key];
        constants[key] = factory();
      }
      this.$.addPackageFields(constants);
    });
  }
})