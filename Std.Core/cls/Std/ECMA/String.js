'ECMA.Object'.subclass(String, {
  // runtime system required for service providers
  system$: 'Std.Runtime.System'
}, I => {
  "use strict";
  I.access({
    //@{Std.Logic.Object?} get logic object at path given by this string or nothing
    logic: function() {
      // this is a String object, not a string value
      return I.resolveLogicName(this.valueOf());
    },
    //@{object?} get provider of service whose name is given by this string or nothing
    provider: function() {
      // this is a String object, not a string value
      return I.system$.provide(this.valueOf());
    }
  });
  I.know({
    //@ Ensure this string ends with a postfix.
    //@param postfix {string} required postfix
    //@return {string} this string or this string appended with postfix
    endingWith: function(postfix) {
      return this.endsWith(postfix) ? this : this + postfix;
    },
    //@ Ensure this string starts with a prefix.
    //@param prefix {string} required prefix
    //@return {string} this string or this string prepended with prefix
    startingWith: function(prefix) {
      return this.startsWith(prefix) ? this : prefix + this;
    }
  });
})