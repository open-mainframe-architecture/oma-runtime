function refine(I) {
  "use strict";
  I.know({
    //@ Iterate over children of this behavior.
    //@return {iterable} iterable behaviors
    iterateChildren: function() {
      return this.childBehaviors[Symbol.iterator]();
    },
    //@ Iterate over super behaviors until the root behavior has been reached.
    //@return {iterable} iterable behaviors
    iterateHeritage: function* () {
      let behavior = this, parentBehavior;
      while ((parentBehavior = behavior.parentBehavior) !== behavior) {
        yield parentBehavior;
        behavior = parentBehavior;
      }
      return;
    },
    //@ Iterate over offspring of this behavior, either top-down or bottom-up.
    //@param bottomUp {boolean?} true to visit children before parent, otherwise after parent
    //@param skipRoot {boolean?} true to skip this behavior in the iterator, otherwise include it
    //@return {iterable} iterable behaviors
    iterateOffspring: function(bottomUp, skipRoot) {
      // by default, walk over this behavior as the tree root, otherwise walk over child forest
      const roots = (skipRoot ? this.childBehaviors : [this])[Symbol.iterator]();
      // iterate children before parent (bottom up) or iterate parent before children (top down)
      const direction = bottomUp ? function up(behavior) {
        return [I.Loop.map(behavior.iterateChildren(), up), behavior][Symbol.iterator]();
      } : function down(behavior) {
        return [behavior, I.Loop.map(behavior.iterateChildren(), down)][Symbol.iterator]();
      };
      // iterate over roots in appropriate direction and flatten all iterated iterators
      return I.Loop.flatten(I.Loop.map(roots, direction));
    }
  });
}