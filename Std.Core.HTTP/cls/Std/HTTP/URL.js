//@ A decoded URL.
'BaseObject'.subclass(I => {
  "use strict";
  // regular expression to match URL scheme, authority, path, query and fragment
  const COMPONENTS = /^(?:([^:/?#]+):)?(?:\/\/([^/?#]*))?([^?#]+)?(?:\?([^#]*))?(?:#(.*))?$/;
  // regular expression to match user, password, host and port in nonempty URL authority
  const AUTHORITY = /^(?:([^:]+)(?::(.*))@)?([^:]+)(?::([0-9]{1,5}))?$/;
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
    build: function(scheme, user, password, host, port, path, query, fragment) {
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
    encode: function() {
      const output = [];
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
    //@param visit {Std.Closure} called with parameter value and name
    //@return {boolean} false if a visit returned false, otherwise true
    enumerateParameters: function(visit) {
      const query = this.urlQuery;
      if (query) {
        for (let pair of query) {
          if (visit(pair[1], pair[0]) === false) {
            return false;
          }
        }
      }
      return true;
    },
    //@ Get filename from last path element.
    //@return {string} filename or empty string if path is empty
    getFilename: function() {
      const path = this.urlPath;
      return path ? path[path.length - 1] : '';
    },
    //@ Get URL fragment.
    //@return {string} fragment, possible empty
    getFragment: function() {
      return this.urlFragment;
    },
    //@ Get host name or address.
    //@return {string} host, possible empty
    getHost: function() {
      return this.urlHost;
    },
    //@ Get user password.
    //@return {string} password, possible empty
    getPassword: function() {
      return this.urlPassword;
    },
    //@ Get port number on host.
    //@return {string} port number, possible empty
    getPort: function() {
      return this.urlPort;
    },
    //@ Get URL scheme.
    //@return {string} scheme, possible empty
    getScheme: function() {
      return this.urlScheme;
    },
    //@ Get user name.
    //@return {string?} name, possible empty
    getUser: function() {
      return this.urlUser;
    },
    //@ Is the path of this URL nonempty?
    //@return {boolean} true if path is nonempty, otherwise false for empty path
    hasPath: function() {
      return !!this.urlPath;
    },
    //@ Is the path of this URL absolute?
    //@return {boolean} true if path is absolute, otherwise false for relative path
    isAbsolute: function() {
      return !!this.urlPath && !this.urlPath[0];
    },
    //@ Iterate path elements.
    //@return {Std.Iterator} iterator over path elements
    walkPath: function() {
      const path = this.urlPath;
      if (!path) {
        return I.Loop.Empty;
      }
      const iterator = path.walk();
      if (!path[0]) {
        // skip empty header element of absolute paths
        iterator.step();
      }
      return iterator;
    },
    //@ Clone this URL except for credentials, i.e. user and password.
    //@return {Std.HTTP.URL} this or a new URL
    withoutCredentials: function() {
      if (this.urlUser) {
        const scheme = this.urlScheme, host = this.urlHost, port = this.urlPort;
        const path = this.urlPath, query = this.urlQuery, fragment = this.urlFragment;
        return I.$.create(scheme, '', '', host, port, path, query, fragment);
      }
      return this;
    },
    //@ Clone this URL except for the fragment part.
    //@return {Std.HTTP.URL} this or a new URL
    withoutFragment: function() {
      if (this.urlFragment) {
        const user = this.urlUser, password = this.urlPassword;
        const scheme = this.urlScheme, host = this.urlHost, port = this.urlPort;
        const path = this.urlPath, query = this.urlQuery;
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
    decode: function(input) {
      const components = COMPONENTS.exec(input);
      if (components) {
        const authority = components[2] && AUTHORITY.exec(components[2]);
        if (!components[2] || authority) {
          const scheme = components[1] && decodeURIComponent(components[1]);
          const user = authority && authority[1] && decodeURIComponent(authority[1]);
          const password = authority && authority[2] && decodeURIComponent(authority[2]);
          const host = authority && authority[3] && decodeURIComponent(authority[3]);
          const port = authority && authority[4] && decodeURIComponent(authority[4]);
          const path = components[3] && components[3].split('/').map(decodeURIComponent);
          const query = components[4] && components[4].split('&').map(decodeParameter);
          const fragment = components[5] && decodeURIComponent(components[5]);
          return I.$.create(scheme, user, password, host, port, path, query, fragment);
        }
      }
    },
    //@ Encode URL or leave it as is.
    //@param it {string|Std.HTTP.URL} URL to encode or string with encoded URL
    //@return {string} URL encoding
    encode: function(it) {
      return typeof it === 'string' ? it : it.encode();
    }
  });
  // hoist decoder/encoder of URL parameters
  function decodeParameter(parameter) {
    return parameter.split('=').map(decodeURIComponent);
  }
  function encodeParameter(pair) {
    return `${encodeURIComponent(pair[0])}=${encodeURIComponent(pair[1])}`;
  }
})