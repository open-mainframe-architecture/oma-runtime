'Std.BaseObject+Std.Manager'.subclass(['Std.Core.Theater.Management'], {
  http$: 'Std.HTTP.Client'
}, function (I) {
  "use strict";
  // I describe a runtime environment that embeds a runtime system.
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
    globalScope: I.burdenSubclass,
    isMinified: function () {
      return /\.min\.js$/.test(I.$module.getBundle().getLocation().getFilename());
    },
    isSubsidiary: I.burdenSubclass
  });
  I.play({
    initialize: I.doNothing,
    loadScript: function (location) {
      return I.http$.get(location).completion().triggers(function (completion) {
        var responseBody = completion.origin().get().getBody();
        // defer script compilation and execution to mimic semantics of browser script tags
        I.$.$rt.asap(function () { I.compileClosure(responseBody)(); });
      });
    },
    loadScripts: function (locations) {
      return I.When.all(locations.map(function (location) {
        return this.$agent.loadScript(location).completion();
      }, this)).triggers();
    }
  });
})