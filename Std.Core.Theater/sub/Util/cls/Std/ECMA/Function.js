'super'.subclass({
  // use extra actor to perform on stage
  extra$: 'Std.Role'
}, function(I) {
  "use strict";
  I.know({
    //@ Perform code of this closure on theater stage.
    //@param ... {*} scene parameters
    //@return {Std.Theater.Job} running job
    play: function() {
      return I.extra$.runScene(this, [...arguments]);
    }
  });
})