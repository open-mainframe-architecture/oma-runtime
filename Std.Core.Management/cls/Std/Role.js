function refine(I) {
  "use strict";
  I.play({
    //@ Perform death scene.
    //@promise {boolean} true if the actor is dead, otherwise false
    kill: function() {
      // swallow poison pill on stage to inform manager about suicide attempt
      throw I._.Theater._.Actor._.PoisonPill;
    }
  });
}