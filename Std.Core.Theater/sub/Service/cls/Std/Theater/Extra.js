//@ An extra performs work on stage, without a proper agent method.
'BaseObject+Role'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false,
    Service: true
  });
  I.play({
    //@ Delegate stage performance to closure.
    //@closure {Rt.Closure} code to execute on stage
    //@promise {any} closure result
    performScene: function (closure) {
      return closure();
    }
  });
})