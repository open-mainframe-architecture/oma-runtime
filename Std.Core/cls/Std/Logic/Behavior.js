function refine(I) {
  "use strict";
  I.know({
    //@ Create iterator that walks over children of this behavior.
    //@return {Std.Iterator} iterator over behaviors
    walkChildren: function() {
      return this.childBehaviors.walk();
    },
    //@ Create iterator that walks over super behaviors until the root behavior has been reached.
    //@return {Std.Iterator} iterator over behaviors
    walkHeritage: function() {
      return I.Loop.inject(this.parentBehavior, function(behavior) {
        if (behavior.parentBehavior !== behavior) {
          return behavior.parentBehavior;
        }
      });
    },
    //@ Create iterator that walks over offspring of this behavior, either top-down or bottom-up.
    //@param bottomUp {boolean?} true to visit children before parent, otherwise after parent
    //@param skipRoot {boolean?} true to skip this behavior in the iterator, otherwise include it
    //@return {Std.Iterator} iterator over behaviors
    walkOffspring: function(bottomUp, skipRoot) {
      // by default, walk over this behavior as the tree root, otherwise walk over child forest
      var roots = skipRoot ? this.childBehaviors : [this];
      var direction = bottomUp ? function up(behavior) {
        return [I.Loop.collect(behavior.walkChildren(), up), behavior].walk();
      } : function down(behavior) {
        return [behavior, I.Loop.collect(behavior.walkChildren(), down)].walk();
      };
      return I.Loop.flatten(I.Loop.collect(roots.walk(), direction));
    }
  });
}