'BaseObject+Stream'.subclass(function (I) {
  "use strict";
  // I describe a stream that decorates another stream.
  I.have({
    decoratedStream: null
  });
  I.know({
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