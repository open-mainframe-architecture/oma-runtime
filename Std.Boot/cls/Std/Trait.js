//@ I am the root mixin.
'BaseObject'.subclass((I, We) => {
  "use strict";
  const BaseObject = I._.BaseObject;
  I.am({
    Abstract: true
  });
  We.have({
    //@{[Any]} class specification/module pairs that define and refine this mixin
    definingSpecs: null,
    //@{[Std.Logic.Class]} classes that have been mixed-in by this mixin
    mixedInClasses: null
  });
  We.know({
    buildLogical: function(context, key, module) {
      We.$super.buildLogical.call(this, context, key, module);
      // cannot wait for unveil
      this.definingSpecs = [];
      this.mixedInClasses = [];
    },
    describes: function(it) {
      // if it is an object, test whether class of object is derived from this trait class
      return BaseObject.describes(it) && this.isTraitFor(it.$);
    },
    //@return {boolean} false if this trait class is mixed-in, otherwise true
    isMixin: function() {
      return !this.traitBehavior;
    },
    prepareLoad: function(loader) {
      We.$super.prepareLoad.call(this, loader);
      if (!this.traitBehavior) {
        // run the class script of this mixin against existing mixed-in classes
        for (let instCls of this.mixedInClasses) {
          loader.addClassLoader(instCls);
        }
        // register spec and module for future applications of this mixin
        this.definingSpecs.push(loader.getSpec(), loader.getModule());
      }
    },
    //@ Add mixed-in class of this mixin.
    //@param instCls {Std.Logic.Class} mixed-in class
    //@return nothing
    addMixedClass: function(instCls) {
      instCls.traitBehavior = this;
      instCls.behaviorFlags_.Abstract = true;
      instCls.$.traitBehavior = this.$;
      this.mixedInClasses.push(instCls);
    },
    //@ Enumerate over class specification/module pairs that define/refine this mixin.
    //@param visit {Std.Closure} closure is called with class specification and module
    //@return {boolean} false if some visit returned false, otherwise true
    enumerateSpecs: function(visit) {
      const specs = this.definingSpecs, n = specs.length;
      for (let i = 0; i < n; i += 2) {
        if (visit(specs[i], specs[i + 1]) === false) {
          return false;
        }
      }
      return true;
    },
    //@ Find class that derives from this trait class, starting at some base class.
    //@param baseCls {Std.Logic.Class} class where search starts
    //@return {Std.Logic.Class?} mixed-in class or nothing
    getMixedClass: function(baseCls) {
      if (this.isTraitFor(baseCls)) {
        return baseCls;
      }
      baseCls = this.getParentBehavior().getMixedClass(baseCls);
      if (baseCls) {
        return baseCls.getMixedChild(this.traitBehavior || this);
      }
    },
    //@ Test whether behavior derives from this trait class.
    //@param behavior {Std.Logic.Behavior} behavior to test
    //@return {boolean} true if derived from this trait class, otherwise false
    isTraitFor: function(behavior) {
      if (this === I.$) {
        return true;
      }
      if (this.traitBehavior && !this.getParentBehavior().isTraitFor(behavior)) {
        return false;
      }
      return behavior.isMixedBy(this.traitBehavior || this);
    }
  });
})