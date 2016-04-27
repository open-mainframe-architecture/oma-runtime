function refine(I) {
  "use strict";
  /*global console*/
  I.refine({
    warn: function(situation) {
      I.$former.warn.call(this, situation);
      console.warn(situation);
    }
  });
}