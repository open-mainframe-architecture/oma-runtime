function refine(I) {
  "use strict";
  I.know({
    // create iterator that walks over children of this behavior
    walkChildren: function() {
      return this.childBehaviors.walk();
    },
    // create iterator that walks over super behaviors until the root behavior has been reached
    walkHeritage: function() {
      return I.Loop.inject(this.parentBehavior, function(behavior) {
        if (behavior.parentBehavior !== behavior) {
          return behavior.parentBehavior;
        }
      });
    },
    // create iterator that walks over offspring of this behavior, either top-down or bottom-up
    walkOffspring: function(bottomUp) {
      var direction = bottomUp ? bottomUpOffspring : topDownOffspring;
      return I.Loop.flatten(I.Loop.collect(this.walkChildren(), direction));
    }
  });
  function bottomUpOffspring(behavior) {
    return [I.Loop.collect(behavior.walkChildren(), bottomUpOffspring), behavior].walk();
  }
  function topDownOffspring(behavior) {
    return [behavior, I.Loop.collect(behavior.walkChildren(), topDownOffspring)].walk();
  }
}