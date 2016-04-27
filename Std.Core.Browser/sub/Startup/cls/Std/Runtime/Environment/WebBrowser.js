'super'.subclass({
  data$: 'Std.Data',
  image$: 'Std.Runtime.Image'
}, I => {
  "use strict";
  /*global document*/
  I.setup(() => {
    const scripts = document.getElementsByTagName('script');
    const json = JSON.parse(scripts[scripts.length - 1].textContent);
    I.image$.assignSpecification(I.data$.unmarshal(json, 'Runtime.Image')).run();
  });
})