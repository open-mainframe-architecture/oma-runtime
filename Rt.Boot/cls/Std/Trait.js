'BaseObject'.subclass(function (I, We) {
  "use strict";
  // I am the root class of mixins.
  I.am({
    Abstract: true
  });
  We.have({
    // list with class specs/module pairs, which define and refine this mixin
    definingSpecs: null,
    // list with classes that have been mixed-in by this mixin
    mixedInClasses: null
  });
  We.know({
    buildLogical: function (context, key, module) {
      We.$super.buildLogical.call(this, context, key, module);
      // cannot wait for unveil
      this.definingSpecs = [];
      this.mixedInClasses = [];
    },
    describes: function (it) {
      // if it is an object, test whether class of object is derived from this trait class
      return I._.BaseObject.describes(it) && this.isTraitFor(it.$);
    },
    isMixin: function () {
      // if a trait class is mixed-in, the trait class is not a mixin
      return !this.traitBehavior;
    },
    prepareLoad: function (loader) {
      We.$super.prepareLoad.call(this, loader);
      if (!this.traitBehavior) {
        // run the class script of this mixin against existing mixed-in classes
        this.mixedInClasses.forEach(function (instCls) { loader.addClassLoader(instCls); });
        // register spec and module for future applications of this mixin
        this.definingSpecs.push(loader.getSpec(), loader.getModule());
      }
    },
    // add mixed-in class of this mixin
    addMixedClass: function (instCls) {
      instCls.traitBehavior = this;
      instCls.behaviorFlags_.Abstract = true;
      instCls.$.traitBehavior = this.$;
      this.mixedInClasses.push(instCls);
    },
    // enumerate over class spec/module pairs that define/refine this mixin
    enumerateSpecs: function (visit) {
      var specs = this.definingSpecs;
      for (var i = 0, n = specs.length; i < n; i += 2) {
        if (visit(specs[i], specs[i + 1]) === false) {
          return false;
        }
      }
      return true;
    },
    // find class that derives from this trait class, starting at some base class
    getMixedClass: function (baseCls) {
      if (this.isTraitFor(baseCls)) {
        return baseCls;
      }
      baseCls = this.getParentBehavior().getMixedClass(baseCls);
      if (baseCls) {
        return baseCls.getMixedChild(this.traitBehavior || this);
      }
    },
    // test whether behavior derives from this trait class
    isTraitFor: function (behavior) {
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