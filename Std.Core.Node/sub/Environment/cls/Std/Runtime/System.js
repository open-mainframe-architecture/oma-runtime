//@ Improve parentless Node.js environment with logging capabilities.
'super'.subclass({
  constants$: 'Std.Runtime.Constants'
}, I => {
  "use strict";
  /*global console*/
  if (!I.constants$.parentEmitter) {
    I.refine({
      warn: function(situation) {
        I.$former.warn.call(this, situation);
        console.warn(situation);
      }
    });
    // handy for now, remove later
    /*global require*/
    I.setup(() => require('repl').start({ prompt: 'oma>', useGlobal: true }));
  }
})