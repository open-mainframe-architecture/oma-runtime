'super'.subclass({
  image$: 'Std.Runtime.Image',
  typespace$: 'Std.Data.Typespace'
}, I => {
  "use strict";
  /*global document*/
  I.setup(() => {
    const scripts = document.getElementsByTagName('script');
    const json = JSON.parse(scripts[scripts.length - 1].textContent);
    I.image$.assignSpecification(I.typespace$.unmarshal(json, 'Runtime.Image')).run();
  });
})