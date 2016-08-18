'RemoteRole'.subclass(['Std.Core.Theater.Remote'], {
  // constants with location of runtime bundle loader
  constants$: 'Std.Runtime.Constants',
  // runtime environment
  environment$: 'Std.Runtime.Environment',
  // user settings
  settings$: 'Std.Runtime.Settings',
  // standard datatypes
  typespace$: 'Std.Data.Typespace'
}, I => {
  "use strict";
  I.have({
    //@{Std.Data.Value.Record} Runtime.Image record value
    bootRecord: null,
    //@{Std.Table} map name to bundle
    bundleTable: null,
    //@{Std.Table} map name to loading, loaded or unloadable module
    moduleTable: null,
    //@{Std.Table} map module name to directory where module assets are published
    modulePublications: null,
    //@{boolean} true if minified JavaScript is preferred over original source
    preferCompact: I.constants$.bundleLocation.toLowerCase().endsWith('.min.js'),
  });
  I.know({
    initializeWork: function(agent) {
      I.$super.initializeWork.call(this, agent);
      // run scene to kick off image loading with boot image record
      agent.runScene(() =>
        I.environment$.attainBootRecord().propels(bootRecord => agent.boot(bootRecord.image))
      );
    },
    //@ Initialize image administration.
    //@return nothing
    buildAdministration: function() {
      const bundleTable = this.bundleTable = I.createTable();
      const moduleTable = this.moduleTable = I.createTable();
      const modulePublications = this.modulePublications = I.createTable();
      const bootRecord = this.bootRecord;
      const bundleReleases = bootRecord.bundles, moduleValues = bootRecord.modules;
      const publish = bootRecord.constants.publish;
      const root = I.settings$.option('Main.root');
      const publicHome = `${root ? root.endingWith('/') : ''}_/${publish}`;
      const bootModule = this.$rt.getBootModule(), bootModuleName = bootModule.getName();
      const runtimeBundle = bootModule.getBundle(), runtimeBundleName = runtimeBundle.getName();
      I.failUnless('runtime bundle missing', bundleReleases.$select(runtimeBundleName));
      const bundlePublications = I.createTable();
      for (let name of bundleReleases.$indices) {
        const release = bundleReleases.$select(name);
        bundleTable[name] = name === runtimeBundleName ? runtimeBundle : I._.Bundle.create(name);
        const home = `${publicHome}/${name}/${release}`;
        bundlePublications[name] = home;
        modulePublications[`${bootModuleName}.${name}`] = `${home}/0`;
      }
      const heavyBundle = bootRecord.heavy;
      if (heavyBundle) {
        bundleTable[''] = I._.Bundle.create('heavy');
        bundlePublications[''] = heavyBundle;
        modulePublications[`${bootModuleName}.heavy`] = `${heavyBundle}/${publish}/0`;
      }
      for (let name of moduleValues.$indices) {
        const bundledModule = moduleValues.$select(name);
        const bundleName = bundledModule.bundle, ordinal = bundledModule.ordinal;
        modulePublications[name] = `${bundlePublications[bundleName]}/${ordinal}`;
        const module = I.resolveLogicName(name);
        if (module) {
          I.failUnless('module conflict', module.isModule());
          moduleTable[name] = module;
        }
      }
    }
  });
  I.play({
    //@ Boot image with boot record.
    //@param value {Std.Data.Value.Record} Runtime.Image record value
    //@promise nothing
    //@except when the image has already been booted
    boot: function(value) {
      I.failUnless('boot image twice', !this.bootRecord);
      this.bootRecord = value;
      this.buildAdministration();
      console.log(`booted image at ${this.$rt.uptime()}`);
      console.log(I.settings$.option('Main.modules'));
    },
    //@ Load modules from bundle.
    //@param bundleName {string} name of bundle to load
    //@param moduleSpecs {object|Std.Table} mapping from module name to specification
    //@promise nothing
    //@except when the image has not been booted
    loadBundle: function(bundleName, moduleSpecs) {
      I.failUnless('load bundle before boot', this.bootRecord);
      const bundle = this.bundleTable[bundleName] || I.fail(`unknown bundle ${bundleName}`);

    }
  });
})