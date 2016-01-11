'BaseObject+Stream'.subclass(function (I) {
  "use strict";
  // I describe a stream whose input and/or output sides delegate to other streams.
  I.am({
    Abstract: false
  });
  I.have({
    inputStream: null,
    outputStream: null
  });
  I.know({
    build: function (input, output) {
      I.$super.build.call(this);
      this.inputStream = input;
      this.outputStream = output;
    }
  });
  I.peek({
    isReadable: function () {
      return !!this.inputStream && this.inputStream.isReadable();
    },
    isWritable: function () {
      return !!this.outputStream && this.outputStream.isWritable();
    }
  });
  I.play({
    read: function () {
      return this.inputStream.read();
    },
    write: function (it) {
      return this.outputStream.write(it);
    }
  });
})