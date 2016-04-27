//@ A web browser runtime environment.
'AbstractWeb'.subclass(['Std.Core.Web.Environment', 'Std.Core.HTTP'], I => {
  "use strict";
  /*global document*/
  const URL = I._.HTTP._.URL;
  I.am({
    Abstract: false
  });
  I.play({
    loadScripts: function(locations) {
      if (locations.length) {
        // browsers use the DOM to load scripts
        return I.Load.create(locations).triggers();
      }
    }
  });
  I.nest({
    //@ A load event fires when a browser has loaded scripts in the document head.
    Load: 'Std.Event'.subclass(function(I) {
      I.have({
        //@{[string]} encoded URLs of scripts to load
        locations: null,
        //@{integer} number of scripts still to load
        remaining: null,
        //@{[string]?} URLs of failed scripts
        failed: null,
        //@{Std.Closure} bound closure to handle successfully loaded script
        succeed: null,
        //@{Std.Closure} bound closure to handle failed script
        fail: null
      });
      I.know({
        //@param locations {[string]} encoded URLs
        build: function(locations) {
          I.$super.build.call(this);
          this.locations = locations.map(URL._.encode);
        },
        unveil: function() {
          I.$super.unveil.call(this);
          this.remaining = this.locations.length;
        },
        charge: function(parent, blooper) {
          I.$super.charge.call(this, parent, blooper);
          const succeed = this.succeed = this.doneScript.bind(this);
          const fail = this.fail = this.failScript.bind(this, blooper);
          // add script elements to DOM fragment
          const fragment = document.createDocumentFragment();
          for (let location of this.locations) {
            const scriptElement = document.createElement('script');
            scriptElement.addEventListener('load', succeed);
            scriptElement.addEventListener('error', fail);
            scriptElement.src = location;
            fragment.appendChild(scriptElement);
          }
          // add fragment to document head to start parallel loading
          document.head.appendChild(fragment);
        },
        //@return true
        isFallible: I.returnTrue,
        //@ A script was successfully loaded.
        //@param domEvent {Any} load event from DOM
        //@return nothing
        doneScript: function(domEvent) {
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
        failScript: function(blooper, domEvent) {
          this.releaseScript(domEvent.target);
          const failed = this.failed || (this.failed = []);
          failed.push(domEvent.target.src);
          blooper.failAll(this.locations, failed);
        },
        //@ Clean up when script finishes.
        //@param scriptElement {Any} script element in DOM
        //@return nothing
        releaseScript: function(scriptElement) {
          scriptElement.removeEventListener('load', this.succeed);
          scriptElement.removeEventListener('error', this.fail);
        }
      });
    })
  });
})