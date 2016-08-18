'super'.subclass({
  environment$: 'Std.Runtime.Environment',
  typespace$: 'Std.Data.Typespace'
}, I => {
  "use strict";
  /*global document*/
  I.setup(() => {
    // parse initial Runtime.Environment record from text content of script tag
    const scripts = document.getElementsByTagName('script');
    const json = JSON.parse(scripts[scripts.length - 1].textContent);
    // boot web browser environment
    I.environment$.boot(I.typespace$.unmarshal(json, 'Runtime.Environment')).run();
  });
})