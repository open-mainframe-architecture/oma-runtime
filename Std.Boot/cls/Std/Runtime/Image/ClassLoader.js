//@ A class loader defines or redefines a class.
'BaseObject'.subclass(I => {
  "use strict";
  const Alias = I._.Logic._.Alias, Class = I._.Logic._.Class, Failure = I._.Failure;
  I.have({
    //@{Std.Runtime.Image.ModuleLoader} module loader that created this class loader
    moduleLoader: null,
    //@{Std.Logic.Module} module that contains definitions/refinements of this class loader
    classModule: null,
    //@{Std.Logic.Namespace} namespace where resolution of logic names in class scripts starts
    classNamespace: null,
    //@{Std.Logic.Namespace|Std.Logic.MetaclassPackage} context that owns class of this loader
    classContext: null,
    //@{string} unique key of class in its context
    classKey: null,
    //@{Object} class specification with super, script, legacy, requires and depends properties
    classSpec: null,
    //@{Std.Logic.Class} existing or new class of this loader
    classSubject: null,
    //@{[string|Std.Logic.Class]} cache intermediate evaluation results of super expression
    superParts: null
  });
  I.know({
    //@param loader {Std.Runtime.Image.ModuleLoader} module loader
    //@param module {Std.Logic.Module} module with class definition or refinement
    //@param namespace {Std.Logic.Namespace} namespace for name resolution in script
    //@param context {Std.Logic.Namespace|Std.Logic.MetaclassPackage} home context of class
    //@param key {string} unique key of class
    //@param spec {Object} class specification
    //@param subject {Std.Logic.Class?} alternative class subject to load, otherwise resolve key
    build: function(loader, module, namespace, context, key, spec, subject) {
      I.$super.build.call(this);
      this.moduleLoader = loader;
      this.classModule = module;
      this.classNamespace = namespace;
      this.classContext = context;
      this.classKey = key;
      this.classSpec = spec;
      // look up existing class subject in context if not explicitly specified
      this.classSubject = subject || context.lookup(key);
    },
    //@ Add class loader that runs specification of this loader against alternative subject.
    //@param subject {Std.Logic.Class} class subject of new loader
    //@return nothing
    addClassLoader: function(subject) {
      const module = this.classModule;
      this.moduleLoader.addClassLoader(module, this.classNamespace, this.classSpec, subject);
    },
    //@ Attempt to create class subject of this loader.
    //@return {boolean} true if class was created, otherwise false
    //@except when this loader already has a subject
    //@except when the super expression in the class specification is invalid
    finishCreation: function() {
      this.assert(!this.classSubject);
      const moduleLoader = this.moduleLoader, module = this.classModule, spec = this.classSpec;
      const namespace = this.classNamespace, context = this.classContext, key = this.classKey;
      const superParts = this.superParts || (this.superParts = spec.super.split('+'));
      const n = superParts.length;
      for (let i = 0; i < n; ++i) {
        if (typeof superParts[i] === 'string') {
          const part = namespace.resolve(superParts[i]);
          if (!part) {
            // the name could not be resolved, but perhaps it's possible later 
            return false;
          }
          // first part is class and any other part is also a mixin
          this.assert(Class.describes(part), !i || part.isMixin());
          superParts[i] = part;
        }
      }
      let superCls = superParts[0];
      for (let i = 1; i < n; ++i) {
        // add mixins in appropriate order to create superclass for mixed-in class
        superCls = moduleLoader.addMixin(superCls, superParts[i]);
      }
      const instCls = moduleLoader.addSubclass(module, superCls, context, key, spec.legacy);
      if (namespace === context) {
        namespace.store(instCls, key);
      } else {
        // create package alias for nested class
        context.getScope().addPackageField(module, Alias, key, instCls);
      }
      // successfully created new class
      this.classSubject = instCls;
      return true;
    },
    //@ Get inheritance depth of class subject.
    //@return {integer} distance of subject to root class
    getInheritanceDepth: function() {
      return this.classSubject.getInheritanceDepth();
    },
    //@ Get module that defines/refines the class subject.
    //@return {Std.Logic.Module} module
    getModule: function() {
      return this.classModule;
    },
    //@ Get specification of class definition or refinement.
    //@return {Object} class specification
    getSpec: function() {
      return this.classSpec;
    },
    //@ Test whether this loader has a class subject.
    //@return {boolean} true if loader has subject, otherwise false
    hasClass: function() {
      return !!this.classSubject;
    },
    //@ Run class script to define or redefine the class of this loader.
    //@return nothing
    loadClass: function() {
      const instCls = this.classSubject, spec = this.classSpec, script = spec.script || spec;
      this.assert(!instCls.getParentBehavior().isFinal(), I.isClosure(script));
      if (spec.super && spec.super !== 'super' && instCls.getModule() !== this.classModule) {
        // verify superfluous super expression of class refinement
        const superCls = this.classNamespace.evaluateClassExpression(spec.super);
        this.assert(superCls === instCls.getParentBehavior());
      }
      // create I and We script arguments for instance and class side
      const scriptInst = Object.create(instCls._), scriptMeta = I.createTable();
      // empty property key links script argument in running script back to this class loader
      scriptInst[''] = scriptMeta[''] = this;
      // initialize keywords of script arguments
      this.prepareScript(scriptInst, scriptMeta);
      if (spec.requires) {
        const satisfactions_ = this.$rt.satisfy(spec.requires);
        for (let serviceKey in satisfactions_) {
          if (!I.isPropertyOwner(scriptInst, serviceKey)) {
            // install required service provider if key not already defined in I argument
            I.defineConstant(scriptInst, serviceKey, satisfactions_[serviceKey]);
          }
        }
      }
      const immutableScriptInst = Object.freeze(Object.create(scriptInst));
      const immutableScriptMeta = Object.freeze(Object.create(scriptMeta));
      try {
        script(immutableScriptInst, immutableScriptMeta);
      } catch (exception) {
        throw Failure.create(this, exception);
      }
      // break references to keywords that only made sense during script execution
      for (let keyword in scriptInst) {
        delete scriptInst[keyword];
      }
      for (let keyword in scriptMeta) {
        delete scriptMeta[keyword];
      }
    },
    //@ Prepare subject to run script of this loader in the near future.
    //@return nothing
    prepareLoad: function() {
      this.classSubject.prepareLoad(this);
    },
    //@ Prepare script arguments of this loader.
    //@param scriptInst {Std.Table} instance side of class script, usually called I
    //@param scriptMeta {Std.Table} class side of class script, usually called We
    //@return nothing
    prepareScript: function(scriptInst, scriptMeta) {
      const instCls = this.classSubject;
      // I.$ for class and We.$ for metaclass
      I.defineConstant(scriptInst, '$', instCls);
      I.defineConstant(scriptMeta, '$', instCls.$);
      // I.$mixin if subject class is mixed-in
      if (instCls.getTraitBehavior()) {
        I.defineConstant(scriptInst, '$mixin', instCls.getTraitBehavior());
      }
      // I._ for access to namespace table
      I.defineConstant(scriptInst, '_', this.classNamespace._);
      // I.$module for module that holds script code
      I.defineConstant(scriptInst, '$module', this.classModule);
      // I.$super and We.$super for prototypes of superclass and supermetaclass
      I.defineConstant(scriptInst, '$super', instCls.getParentPrototype());
      I.defineConstant(scriptMeta, '$super', instCls.$.getParentPrototype());
      if (this.classNamespace !== this.classContext && !instCls.getTraitBehavior()) {
        // I.$outer for outer context of nested classes
        I.defineConstant(scriptInst, '$outer', this.classContext.getScope()._);
      }
      if (instCls.getModule() !== this.classModule) {
        // I.$former and We.$former for former definitions of refined methods
        I.defineConstant(scriptInst, '$former', I.createTable());
        I.defineConstant(scriptMeta, '$former', I.createTable());
        // I.refine and We.refine for refined instance methods and class instance methods
        scriptInst.refine = scriptMeta.refine = scriptRefine;
      }
      if (instCls.isRootBehavior() || instCls.getModule() === this.classModule) {
        // I.am to specify flags of new class (or to introduce new flags in root class)
        scriptInst.am = scriptAm;
      }
      // I.have and We.have for instance variables and class instance variables
      scriptInst.have = scriptMeta.have = scriptHave;
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
  function scriptAm(flags_) { //jshint validthis:true
    this.$.setBehaviorFlags(flags_);
  }
  function scriptHave(variables_) { //jshint validthis:true
    this.$.addInstanceVariables(this[''].classModule, variables_);
  }
  function scriptAccess(accessors_) { //jshint validthis:true
    this.$.addInstanceAccessors(this[''].classModule, accessors_);
  }
  function scriptKnow(fields_) { //jshint validthis:true
    this.$.addInstanceKnowledge(this[''].classModule, fields_);
  }
  function scriptRefine(methods_) { //jshint validthis:true
    this.$.refineInstanceMethods(this[''].classModule, methods_, this.$former);
  }
  function scriptShare(fields_) { //jshint validthis:true
    this.$.addPackageFields(this[''].classModule, fields_);
  }
  function scriptNest(nestedSpecs_) { //jshint validthis:true
    const loader = this[''], module = loader.classModule;
    loader.moduleLoader.addNestedLoaders(module, loader.classNamespace, this.$, nestedSpecs_);
  }
  function scriptSetup(setup) { //jshint validthis:true
    const loader = this[''];
    loader.moduleLoader.addSetupRoutine(I.isClosure(setup) ? setup : () => {
      // add more package constants and subroutines after instance class has been unveiled
      const fields_ = {};
      for (let key in setup) {
        const factory = setup[key];
        fields_[key] = factory();
      }
      this.$.addPackageFields(loader.classModule, fields_);
    });
  }
})