'BaseObject+Role'.subclass(function (I) {
  "use strict";
  // I describe a role to perform extra work on stage, without a proper agent method.
  I.am({
    Abstract: false,
    Service: true
  });
  I.play({
    // delegate stage performance to closure
    performScene: function (closure) {
      return closure();
    }
  });
})