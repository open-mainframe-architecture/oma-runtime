'super'.subclass({
  // use extra actor to perform on stage
  extra$: 'Std.Theater.Extra'
}, function(I) {
  "use strict";
  I.know({
    //@ Perform code of this closure on theater stage.
    //@param inert {boolean?} true for inert job, otherwise running job
    //@return {Std.Theater.Job} inert or running job
    play: function(inert) {
      const job = I.extra$.createScene(this);
      return inert ? job : job.running();
    }
  });
})