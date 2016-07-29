//@ A web browser runtime environment.
'Web'.subclass(['Std.Core.Web.Environment', 'Std.Core.HTTP'], I => {
  "use strict";
  /*global document*/
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
    Load: 'Theater.Cue'.subclass(function(I) {
      I.have({
        //@{[string]} locations of scripts to load
        locations: null,
        //@{integer} number of scripts still to load
        remaining: null,
        //@{[string]?} locations of failed scripts
        failed: null,
        //@{function} bound closure to handle successfully loaded script
        success: null,
        //@{function} bound closure to handle failed script
        error: null
      });
      I.know({
        //@param locations {[string|Std.HTTP.URI]} locations to load
        build: function(locations) {
          I.$super.build.call(this);
          // convert URI to string, leave string as is
          this.locations = locations.map(uri => uri.encode ? uri.encode() : uri);
        },
        unveil: function() {
          I.$super.unveil.call(this);
          this.remaining = this.locations.length;
        },
        charge: function(parent, blooper) {
          I.$super.charge.call(this, parent, blooper);
          const success = this.success = this.doneScript.bind(this);
          const error = this.error = this.errorScript.bind(this, blooper);
          // add script elements to DOM fragment
          const fragment = document.createDocumentFragment();
          this.locations.forEach(location => {
            const scriptElement = document.createElement('script');
            scriptElement.addEventListener('load', success);
            scriptElement.addEventListener('error', error);
            scriptElement.src = location;
            fragment.appendChild(scriptElement);
          });
          // add fragment to document head to start parallel loading
          document.head.appendChild(fragment);
        },
        isFallible: I.returnTrue,
        //@ A script was successfully loaded.
        //@param domEvent {object} load event from DOM
        //@return nothing
        doneScript: function(domEvent) {
          this.releaseScript(domEvent.target);
          // fire this event when all locations have been loaded
          if (--this.remaining === 0) {
            this.fire();
          }
        },
        //@ A script failed to load.
        //@param blooper {Std.Theater.Blooper} blooper cue
        //@param domEvent {object} load event from DOM
        //@return nothing
        errorScript: function(blooper, domEvent) {
          this.releaseScript(domEvent.target);
          const failedScripts = this.failed || (this.failed = []);
          failedScripts.push(domEvent.target.src);
          blooper.mistake(failedScripts);
        },
        //@ Clean up when script finishes.
        //@param scriptElement {Any} script element in DOM
        //@return nothing
        releaseScript: function(scriptElement) {
          scriptElement.removeEventListener('load', this.success);
          scriptElement.removeEventListener('error', this.error);
        }
      });
    })
  });
})