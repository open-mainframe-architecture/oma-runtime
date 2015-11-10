'Std.BaseObject+Std.Role'.subclass({
  $http: 'Std.HTTP.Client'
}, function(I) {
  "use strict";
  // I describe runtime environments that embed runtime systems.
  I.am({
    Service: true
  });
  I.know({
    initialize: function(agent) {
      I.$super.initialize.call(this);
      // schedule first scene to initialize this runtime environment
      agent.initialize().running();
    }
  });
  I.peek({
    globalScope: I.burdenSubclass
  });
  I.play({
    initialize: I.doNothing,
    loadScripts: function(locations) {
      var scripts = locations.length;
      if (!scripts) {
        return;
      }
      var agent = this.$agent, causes = [], success = I.When.spark(), loaded = 0;
      var failure = I.When.spark().yields(function() {
        return I._.Std._.Failure.create(agent, causes);
      });
      function loadScript(response) {
        try {
          new GlobalEval(response.getBody())();
          if (++loaded === scripts) {
            success.fire();
          }
        } catch (exception) {
          loadError(exception);
        }
      }
      function loadError(cause) {
        causes.push(cause);
        failure.fire();
      }
      locations.forEach(function(location) {
        I.$http.get(location).done(loadScript, loadError);
      });
      return I.When.one([success, failure]);
    }
  });
  // prevent jshint from complaining about a form of eval.
  var GlobalEval = Function;
})