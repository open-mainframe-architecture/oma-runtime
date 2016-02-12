'super'.subclass({
  extra$: 'Std.Theater.Extra'
}, function (I) {
  "use strict";
  I.know({
    //@ Perform code of this closure on theater stage.
    //@param immobile {boolean?} true for immobile job, otherwise running job
    //@return {Std.Theater.Job} immobile or running job
    play: function (immobile) {
      var job = I.extra$.performScene(this);
      return immobile ? job : job.running();
    }
  });
})