function refine(I) {
  "use strict";
  I.know({
    //@ Create iterator that walks over children of this behavior.
    //@return {Std.Iterator} iterator over behaviors
    walkChildren: function () {
      return this.childBehaviors.walk();
    },
    //@ Create iterator that walks over super behaviors until the root behavior has been reached.
    //@return {Std.Iterator} iterator over behaviors
    walkHeritage: function () {
      return I.Loop.inject(this.parentBehavior, nextParent);
    },
    //@ Create iterator that walks over offspring of this behavior, either top-down or bottom-up.
    //@param bottomUp {boolean?} true to visit children before parent, otherwise after parent
    //@param skipRoot {boolean?} true to skip this behavior in the iterator, otherwise include it
    //@return {Std.Iterator} iterator over behaviors
    walkOffspring: function (bottomUp, skipRoot) {
      var direction = bottomUp ? bottomUpOffspring : topDownOffspring;
      // by default, walk over this behavior as the tree root, otherwise walk over child forest
      var roots = skipRoot ? this.childBehaviors : [this];
      return I.Loop.flatten(I.Loop.collect(roots.walk(), direction));
    }
  });
  function nextParent(behavior) {
    if (behavior.parentBehavior !== behavior) {
      return behavior.parentBehavior;
    }
  }
  function bottomUpOffspring(behavior) {
    return [I.Loop.collect(behavior.walkChildren(), bottomUpOffspring), behavior].walk();
  }
  function topDownOffspring(behavior) {
    return [behavior, I.Loop.collect(behavior.walkChildren(), topDownOffspring)].walk();
  }
}