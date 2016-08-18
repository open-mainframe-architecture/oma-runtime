//@ Runtime settings with user options.
'Object'.subclass(I => {
  "use strict";
  I.have({
    //@{Std.Data.Value.Record} Runtime.Settings record value
    settingsRecord: null
  });
  I.know({
    //@param record {Std.Data.Value.Record} Runtime.Settings record value
    build: function(record) {
      I.$super.build.call(this);
      this.settingsRecord = record;
    },
    //@ Get user option.
    //@param path {string} option path
    //@return {*|Std.Runtime.Options?} option, options or nothing if path is invalid
    option: function(path) {
      let record = this.settingsRecord;
      for (let key of path.split('.')) {
        if (!record) {
          return;
        }
        record = record.$select(key);
      }
      return record;
    }
  });
})