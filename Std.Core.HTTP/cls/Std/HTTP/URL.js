'BaseObject'.subclass(function (I) {
  "use strict";
  // I describe a decoded URL.
  I.have({
    // scheme, e.g. http or ftp or about
    urlScheme: null,
    // optional user name if credentials are important
    urlUser: null,
    // 'hidden' password of user
    urlPassword: null,
    // host name
    urlHost: null,
    // port number
    urlPort: null,
    // array with path elements
    urlPath: null,
    // array with parameters where each parameter is array with name and value
    urlQuery: null,
    // fragment is only significant for browsers
    urlFragment: null
  });
  I.know({
    build: function (scheme, user, password, host, port, path, query, fragment) {
      I.$super.build.call(this);
      this.urlScheme = scheme && scheme.toLowerCase() || '';
      this.urlUser = host && user || '';
      this.urlPassword = host && user && password || '';
      this.urlHost = host && host.toLowerCase() || '';
      this.urlPort = host && port || '';
      this.urlPath = path || null;
      this.urlQuery = query || null;
      this.urlFragment = fragment || '';
    },
    encode: function () {
      var output = [];
      if (this.urlScheme) {
        output.push(encodeURIComponent(this.urlScheme), ':');
      }
      if (this.urlScheme || this.urlHost) {
        output.push('//');
      }
      if (this.urlHost) {
        if (this.urlUser) {
          output.push(encodeURIComponent(this.urlUser), '@');
        }
        output.push(encodeURIComponent(this.urlHost), this.urlPort ? ':' : '', this.urlPort);
      }
      if (this.urlPath) {
        output.push(this.urlPath.map(encodeURIComponent).join('/'));
      }
      if (this.urlQuery) {
        output.push('?', this.urlQuery.map(encodeParameter).join('&'));
      }
      if (this.urlFragment) {
        output.push('#', this.urlFragment);
      }
      return output.join('');
    },
    enumerateParameters: function (visit) {
      var query = this.urlQuery;
      if (query) {
        for (var i = 0, n = query.length; i < n; ++i) {
          if (visit(query[i][1], query[i][0]) === false) {
            return false;
          }
        }
      }
      return true;
    },
    enumeratePathElements: function (visit) {
      var path = this.urlPath;
      if (path) {
        for (var first = path[0] ? 0 : 1, i = first, n = path.length; i < n; ++i) {
          if (visit(path[i], i + 1 - first) === false) {
            return false;
          }
        }
      }
      return true;
    },
    getFilename: function () {
      var path = this.urlPath;
      return path ? path[path.length - 1] : '';
    },
    getFragment: function () {
      return this.urlFragment;
    },
    getHost: function () {
      return this.urlHost;
    },
    getPassword: function () {
      return this.urlPassword;
    },
    getPath: function () {
      return this.urlPath ? this.urlPath.join('/') : '';
    },
    getPort: function () {
      return this.urlPort;
    },
    getScheme: function () {
      return this.urlScheme;
    },
    getUser: function () {
      return this.urlUser;
    },
    hasPath: function () {
      return !!this.urlPath;
    },
    isAbsolute: function () {
      return !!this.urlPath && !this.urlPath[0];
    },
    withoutCredentials: function () {
      if (this.urlUser) {
        var scheme = this.urlScheme;
        var host = this.urlHost;
        var port = this.urlPort;
        var path = this.urlPath;
        var query = this.urlQuery;
        var fragment = this.urlFragment;
        return I.$.create(scheme, '', '', host, port, path, query, fragment);
      }
      return this;
    },
    withoutFragment: function () {
      if (this.urlFragment) {
        var scheme = this.urlScheme;
        var user = this.urlUser;
        var password = this.urlPassword;
        var host = this.urlHost;
        var port = this.urlPort;
        var path = this.urlPath;
        var query = this.urlQuery;
        return I.$.create(scheme, user, password, host, port, path, query);
      }
      return this;
    }
  });
  I.share({
    // https://url.spec.whatwg.org, https://tools.ietf.org/html/rfc3986#appendix-B
    decode: function (input) {
      var components = SyntaxURL.exec(input);
      if (components) {
        var authority = components[2] && SyntaxAuthority.exec(components[2]);
        if (!components[2] || authority) {
          var scheme = components[1] && decodeURIComponent(components[1]);
          var user = authority && authority[1] && decodeURIComponent(authority[1]);
          var password = authority && authority[2] && decodeURIComponent(authority[2]);
          var host = authority && authority[3] && decodeURIComponent(authority[3]);
          var port = authority && authority[4] && decodeURIComponent(authority[4]);
          var path = components[3] && components[3].split('/').map(decodeURIComponent);
          var query = components[4] && components[4].split('&').map(decodeParameter);
          var fragment = components[5] && decodeURIComponent(components[5]);
          return I.$.create(scheme, user, password, host, port, path, query, fragment);
        }
      }
    }
  });
  // regular expression to match URL scheme, authority, path, query and fragment
  var SyntaxURL = /^(?:([^:/?#]+):)?(?:\/\/([^/?#]*))?([^?#]+)?(?:\?([^#]*))?(?:#(.*))?$/;
  // regular expression to match user, password, host and port in nonempty URL authority
  var SyntaxAuthority = /^(?:([^:]+)(?::(.*))@)?([^:]+)(?::([0-9]{1,5}))?$/;
  // hoist decoder/encoder of URL parameters
  function decodeParameter(parameter) {
    return parameter.split('=').map(decodeURIComponent);
  }
  function encodeParameter(pair) {
    return encodeURIComponent(pair[0]) + '=' + encodeURIComponent(pair[1]);
  }
})