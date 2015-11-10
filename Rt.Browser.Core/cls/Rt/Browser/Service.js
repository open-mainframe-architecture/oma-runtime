'Env.Service'.subclass(function(I) {
  "use strict";
  /*global window,document*/
  I.am({
    Abstract: false
  });
  I.know({
    initialize: function(agent) {
      I.$super.initialize.call(this, agent);
      var bundle = I.$module.getBundle();
      if (!bundle.bundleHome) {
        // this works when bundle script is executing, but not when initialize scene is performing
        var scripts = document.getElementsByTagName('script');
        var bundleScript = scripts[scripts.length - 1].getAttribute('src');
        bundle.bundleHome = bundleScript.substring(0, bundleScript.lastIndexOf('/'));
      }
    }
  });
  I.peek({
    globalScope: function() {
      return window;
    }
  });
  I.play({
    initialize: function() {
      I.$superRole.initialize.call(this);
      var rt = this.$rt, tick = rt.getUptime();
      return this.$rt.provide('Std.Wait.Clock').delays(0.5).yields(function() {
        var tack = rt.getUptime();
        console.log(tick);
        console.log(tack);
        console.log(tack - tick);
      });
    },
    loadScripts: function(locations) {
      if (!locations.length) {
        return;
      }
      var fragment = document.createDocumentFragment();
      (function() { document.head.appendChild(fragment); }).play();
      var agent = this.$agent, succeed = [], failedScripts = [];
      var failure = I.When.spark().yields(function() {
        return I._.Std._.Failure.create(agent, failedScripts);
      });
      function release(scriptElement) {
        delete scriptElement.success;
        scriptElement.removeEventListener('load', scriptLoaded);
        scriptElement.removeEventListener('error', scriptFailed);
      }
      function scriptLoaded(event) {
        var success = event.target.success;
        release(event.target);
        success.fire();
      }
      function scriptFailed(event) {
        failedScripts.push(event.target);
        release(event.target);
        failure.fire();
      }
      locations.forEach(function(location) {
        var scriptElement = document.createElement('script');
        succeed.push(scriptElement.success = I.When.spark());
        scriptElement.addEventListener('load', scriptLoaded);
        scriptElement.addEventListener('error', scriptFailed);
        scriptElement.src = location;
        fragment.appendChild(scriptElement);
      });
      return I.When.one([I.When.all(succeed), failure]);
    }
  });
})