//@ A decoded URL.
'BaseObject'.subclass(function (I) {
  "use strict";
  I.have({
    //@{string} URL scheme, e.g. http or ftp or about
    urlScheme: null,
    //@{string} user name if credentials are important
    urlUser: null,
    //@{string} 'hidden' password of user
    urlPassword: null,
    //@{string} host name
    urlHost: null,
    //@{string} port number
    urlPort: null,
    //@{[string]?} array with path elements
    urlPath: null,
    //@{[[string]]?} array with parameters where each parameter is array with name and value
    urlQuery: null,
    //@{string} fragment is only significant for browsers
    urlFragment: null
  });
  I.know({
    //@param scheme {string?} URL scheme
    //@param user {string?} user name
    //@param password {string?} user password
    //@param host {string?} host name
    //@param port {string?} host port
    //@param path {[string]?} path elements
    //@param query {[[string]]?} parameter names and values
    //@param fragment {string?} URL fragment
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
    //@ Compute encoded representation of this URL.
    //@return {string} URL in encoded string
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
    //@ Enumarate URL parameters.
    //@param visit {Rt.Closure} called with parameter value and name
    //@return {boolean} false if a visit returned false, otherwise true
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
    //@ Enumarate path elements.
    //@param visit {Rt.Closure} called with path element and one-based index
    //@return {boolean} false if a visit returned false, otherwise true
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
    //@ Get filename from last path element.
    //@return {string} filename or empty string if path is empty
    getFilename: function () {
      var path = this.urlPath;
      return path ? path[path.length - 1] : '';
    },
    //@ Get URL fragment.
    //@return {string} fragment, possible empty
    getFragment: function () {
      return this.urlFragment;
    },
    //@ Get host name or address.
    //@return {string} host, possible empty
    getHost: function () {
      return this.urlHost;
    },
    //@ Get user password.
    //@return {string} password, possible empty
    getPassword: function () {
      return this.urlPassword;
    },
    //@ Get URL path.
    //@return {string} path or empty string if path is empty
    getPath: function () {
      return this.urlPath ? this.urlPath.join('/') : '';
    },
    //@ Get port number on host.
    //@return {string} port number, possible empty
    getPort: function () {
      return this.urlPort;
    },
    //@ Get URL scheme.
    //@return {string} scheme, possible empty
    getScheme: function () {
      return this.urlScheme;
    },
    //@ Get user name.
    //@return {string?} name, possible empty
    getUser: function () {
      return this.urlUser;
    },
    //@ Is the path of this URL nonempty?
    //@return {boolean} true if path is nonempty, otherwise false for empty path
    hasPath: function () {
      return !!this.urlPath;
    },
    //@ Is the path of this URL absolute?
    //@return {boolean} true if path is absolute, otherwise false for relative path
    isAbsolute: function () {
      return !!this.urlPath && !this.urlPath[0];
    },
    //@ Clone this URL except for credentials, i.e. user and password.
    //@return {Std.HTTP.URL} this or a new URL
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
    //@ Clone this URL except for the fragment part.
    //@return {Std.HTTP.URL} this or a new URL
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
    //@ Try to decode URL encoding.
    //@param input {string} encoded URL
    //@return {Std.HTTP.URL?} decoded URL or nothing
    //@more https://url.spec.whatwg.org, https://tools.ietf.org/html/rfc3986#appendix-B
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
    },
    //@ Encode URL or leave it as is.
    //@param it {string|Std.HTTP.URL} URL to encode or string with encoded URL
    //@return {string} URL encoding
    encode: function (it) {
      return typeof it === 'string' ? it : it.encode();
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