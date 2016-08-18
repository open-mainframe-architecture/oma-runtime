'super'.subclass({
  environment$: 'Std.Runtime.Environment',
  typespace$: 'Std.Data.Typespace'
}, I => {
  "use strict";
  /*global require,process*/
  I.setup(() => {
    const path = require('path');
    // construct Runtime.Environment record from JSON representation of image and settings record
    const imagePath = path.resolve(process.argv[2] || 'image.json');
    const settingsPath = path.resolve(process.argv[3] || 'settings.json');
    const json = { image: require(imagePath), settings: { _: require(settingsPath) } };
    // boot Node.js environment
    I.environment$.boot(I.typespace$.unmarshal(json, 'Runtime.Environment')).run();
  });
})