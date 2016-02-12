//@ A web browser runtime environment.
'Env.Service'.subclass(['Std.Core.Runtime', 'Std.Core.HTTP'], function (I) {
  "use strict";
  /*global window,document*/
  I.am({
    Abstract: false
  });
  I.know({
    initialize: function (agent) {
      I.$super.initialize.call(this, agent);
      var scripts = document.getElementsByTagName('script');
      // active script must be part of document source (not dynamically added to the DOM)
      var activeScript = scripts[scripts.length - 1];
      // script locates loader of runtime bundle
      I.$module.getBundle().bundleURL = I._.Std._.HTTP._.URL._.decode(activeScript.src);
      // compile and execute textual body of active script tag
      this.$rt.asap(I.compileClosure(activeScript.textContent));
    }
  });
  I.peek({
    globalScope: function () {
      return window;
    },
    //@return false
    isSubsidiary: I.returnFalse
  });
  I.play({
    loadScript: function (location) {
      return this.$agent.loadScripts([location]);
    },
    loadScripts: function (locations) {
      if (locations.length) {
        // browsers use the DOM to load scripts
        return I.Load.create(locations).triggers();
      }
    }
  });
  I.nest({
    //@ A load event fires when a browser has loaded scripts in the document head.
    Load: 'Std.Event'.subclass(function (I) {
      I.have({
        //@{[string]} encoded URLs of scripts to load
        locations: null,
        //@{integer} number of scripts still to load
        remaining: null,
        //@{[string]?} URLs of failed scripts
        failed: null,
        //@{Rt.Closure} bound closure to handle successfully loaded script
        ondone: null,
        //@{Rt.Closure} bound closure to handle failed script
        onfail: null
      });
      I.know({
        //@param locations {[string]} encoded URLs
        build: function (locations) {
          I.$super.build.call(this);
          this.locations = locations.map(I._.Std._.HTTP._.URL._.encode);
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
        //@return true
        isFallible: I.returnTrue,
        //@ A script was successfully loaded.
        //@param domEvent {Any} load event from DOM
        //@return nothing
        doneScript: function (domEvent) {
          this.releaseScript(domEvent.target);
          // fire this event when all locations have been loaded
          if (--this.remaining === 0) {
            this.fire();
          }
        },
        //@ A script failed to load.
        //@param blooper {Std.Theater.Blooper} blooper event
        //@param domEvent {Any} load event from DOM
        //@return nothing
        failScript: function (blooper, domEvent) {
          this.releaseScript(domEvent.target);
          var failed = this.failed || (this.failed = []);
          failed.push(domEvent.target.src);
          blooper.failAll(this.locations, failed);
        },
        //@ Clean up when script finishes.
        //@param scriptElement {Any} script element in DOM
        //@return nothing
        releaseScript: function (scriptElement) {
          scriptElement.removeEventListener('load', this.ondone);
          scriptElement.removeEventListener('error', this.onfail);
        }
      });
    })
  });
})