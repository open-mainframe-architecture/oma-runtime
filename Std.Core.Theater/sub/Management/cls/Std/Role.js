function refine(I) {
  "use strict";
  I.play({
    // perform death scene
    kill: function () {
      // swallow poison pill on stage to inform manager about suicide attempt
      throw I._.Theater._.Actor._.PoisonPill;
    }
  });
}