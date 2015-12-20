'Env.Service'.subclass(function (I) {
  "use strict";
  /*global window,document*/
  I.am({
    Abstract: false
  });
  I.know({
    initialize: function (agent) {
      I.$super.initialize.call(this, agent);
      var scripts = document.getElementsByTagName('script');
      var activeScript = scripts[scripts.length - 1];
      var location = activeScript.getAttribute('src');
      I.$module.getBundle().bundleHome = location.substring(0, location.lastIndexOf('/'));
      // compile and execute the textual body of the script tag
      this.$rt.asap(I.compileClosure(activeScript.textContent));
    }
  });
  I.peek({
    globalScope: function () {
      return window;
    }
  });
  I.play({
    initialize: function () {
      I.$superRole.initialize.call(this);
      var rt = this.$rt, tick = rt.getUptime();
      return this.$rt.provide('Std.Wait.Clock').delay(0.5).triggers(function () {
        var tack = rt.getUptime();
        console.log(tick);
        console.log(tack);
        console.log(tack - tick);
      });
    },
    loadScripts: function (locations) {
      if (locations.length) {
        // browsers use the DOM to load scripts
        return I.Load.create(locations).triggers();
      }
    }
  });
  I.nest({
    Load: 'Std.Event'.subclass(function (I) {
      // I describe events that fire when browsers load scripts in the document head.
      I.have({
        locations: null,
        remaining: null,
        failed: null,
        ondone: null,
        onfail: null
      });
      I.know({
        build: function (locations) {
          I.$super.build.call(this);
          this.locations = locations;
          this.remaining = locations.length;
        },
        charge: function (parent, blooper) {
          I.$super.charge.call(this, parent);
          var ondone = this.ondone = this.doneScript.bind(this);
          var onfail = this.onfail = this.failScript.bind(this, blooper);
          // add script elements to DOM fragment
          var fragment = document.createDocumentFragment();
          this.locations.forEach(function (location) {
            var scriptElement = document.createElement('script');
            scriptElement.addEventListener('load', ondone);
            scriptElement.addEventListener('error', onfail);
            scriptElement.src = location;
            fragment.appendChild(scriptElement);
          });
          // add fragment to document head to kick off parallel loading
          document.head.appendChild(fragment);
        },
        isFallible: I.returnTrue,
        doneScript: function (domEvent) {
          this.releaseScript(domEvent.target);
          // fire this event when all locations have been loaded
          if (--this.remaining === 0) {
            this.fire();
          }
        },
        failScript: function (blooper, domEvent) {
          this.releaseScript(domEvent.target);
          var failed = this.failed || (this.failed = []);
          failed.push(domEvent.target.src);
          blooper.failAll(this.locations, failed);
        },
        releaseScript: function (scriptElement) {
          scriptElement.removeEventListener('load', this.ondone);
          scriptElement.removeEventListener('error', this.onfail);
        }
      });
    })
  });
})