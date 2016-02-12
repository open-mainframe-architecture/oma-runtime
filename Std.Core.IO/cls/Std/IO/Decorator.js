//@ A decorator decorates another stream.
'BaseObject+Stream'.subclass(function (I) {
  "use strict";
  I.have({
    //@{Std.Stream} decorated stream
    decoratedStream: null
  });
  I.know({
    //@param stream {Std.Stream} decorated stream
    build: function (stream) {
      I.$super.build.call(this);
      this.decoratedStream = stream;
    }
  });
  I.peek({
    isReadable: function () {
      return this.decoratedStream.isReadable();
    },
    isWritable: function () {
      return this.decoratedStream.isWritable();
    }
  });
  I.play({
    read: function () {
      return this.decoratedStream.read();
    },
    write: function (it) {
      return this.decoratedStream.write(it);
    }
  });
})