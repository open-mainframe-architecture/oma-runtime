'Std.BaseObject+Std.Role'.subclass({
  $http: 'Std.HTTP.Client'
}, function (I) {
  "use strict";
  // I describe runtime environments that embed runtime systems.
  I.am({
    Service: true
  });
  I.know({
    initialize: function (agent) {
      I.$super.initialize.call(this);
      // schedule first scene to initialize this runtime environment
      agent.initialize().run();
    }
  });
  I.peek({
    globalScope: I.burdenSubclass
  });
  I.play({
    initialize: I.doNothing,
    loadScripts: function (locations) {
      return I.When.all(locations.map(function (location) {
        return I.$http.get(location).completion();
      }))
        .triggers(function (completions) {
          completions.enumerate(function (completion) {
            var responseBody = completion.origin().get().getBody();
            // defer script compilation and execution in global scope to mimic browser semantics
            I.$.$rt.asap(function () { I.compileClosure(responseBody)(); });
          });
        })
        ;
    }
  });
})