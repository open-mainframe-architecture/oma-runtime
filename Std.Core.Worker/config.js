function configure(module) {
  "use strict";
  /*global WorkerGlobalScope*/
  module.description = 'This module implements core services for a web worker environment.';
  module.depends = ['Std.Core.Web'];
  module.test = () => typeof WorkerGlobalScope !== 'undefined';
  module.provides = {
    'Std.Runtime.Constants with Std.Runtime.WorkerConstants': Provider => Provider.create()
  };
}