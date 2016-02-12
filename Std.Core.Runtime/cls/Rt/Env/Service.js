//@ A runtime environment embeds a runtime system.
'Std.BaseObject+Std.Manager'.subclass(['Std.Core.Theater.Management'], {
  http$: 'Std.HTTP.Client'
}, function (I) {
  "use strict";
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
    //@ Get scope with global variables.
    //@return {Any} object with globals
    globalScope: I.burdenSubclass,
    //@ Is the source of the runtime minified?
    //@return {boolean} true if source of runtime is minified, otherwise false
    isMinified: function () {
      return /\.min\.js$/.test(I.$module.getBundle().getLocation().getFilename());
    },
    //@ Is this a subsidiary of a parent environment?
    //@return {boolean} true if this environment is a subsidiary, otherwise false
    isSubsidiary: I.burdenSubclass
  });
  I.play({
    //@ Initialize runtime environment on stage.
    //@promise nothing
    initialize: I.doNothing,
    //@ Load script.
    //@param location {string|Std.HTTP.URL} location of script
    //@promise nothing when script has been loaded (although execution may still be pending)
    //@except when HTTP access to get script fails
    loadScript: function (location) {
      return I.http$.get(location).completion().triggers(executeScript);
    },
    //@ Load several scripts.
    //@param locations {[string|Std.HTTP.URL]} locations of scripts to load
    //@promise nothing when all scripts have been successfully loaded
    loadScripts: function (locations) {
      return I.When.all(locations.map(startLoad, this)).triggers();
    }
  });
  function startLoad(location) { //jshint validthis:true
    return this.$agent.loadScript(location).completion();
  }
  function executeScript(completion) {
    var responseBody = completion.origin().get().getBody();
    // defer script compilation and execution to mimic semantics of browser script tags
    I.$.$rt.asap(function () { I.compileClosure(responseBody)(); });
  }
})