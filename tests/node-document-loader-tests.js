/**
 * Local tests for the node.js document loader
 *
 * @author goofballLogic
 */
/* eslint-disable quote-props */
const jsonld = require('..');
const assert = require('assert');

describe('For the node.js document loader', function() {
  const documentLoaderType = 'node';
  const requestMock = function(options, callback) {
    // store these for later inspection
    requestMock.calls.push([].slice.call(arguments, 0));
    callback(null, {headers: {}}, '');
  };

  describe('When built with no options specified', function() {
    it('loading should work', function(done) {
      jsonld.useDocumentLoader(documentLoaderType);
      /* eslint-disable-next-line no-unused-vars */
      jsonld.expand('http://schema.org/', function(err, expanded) {
        assert.ifError(err);
        done();
      });
    });
  });

  describe('When built with no explicit headers', function() {
    const options = {request: requestMock};

    it('loading should pass just the ld Accept header', function(done) {
      jsonld.useDocumentLoader(documentLoaderType, options);
      requestMock.calls = [];
      const iri = 'http://some.thing.test.com/my-thing.jsonld';
      jsonld.documentLoader(iri, function(err) {
        if(err) {
          return done(err);
        }
        const actualOptions = (requestMock.calls[0] || {})[0] || {};
        const actualHeaders = actualOptions.headers;
        const expectedHeaders = {
          'Accept': 'application/ld+json, application/json'
        };
        assert.deepEqual(actualHeaders, expectedHeaders);
        done();
      });
    });
  });

  describe('When built using options containing a headers object', function() {
    const options = {request: requestMock};
    options.headers = {
      'x-test-header-1': 'First value',
      'x-test-two': 2.34,
      'Via': '1.0 fred, 1.1 example.com (Apache/1.1)',
      'Authorization': 'Bearer d783jkjaods9f87o83hj'
    };

    /* eslint-disable indent */
    it('loading should pass the headers through on the request',
      function(done) {
      jsonld.useDocumentLoader(documentLoaderType, options);
      requestMock.calls = [];
      const iri = 'http://some.thing.test.com/my-thing.jsonld';
      jsonld.documentLoader(iri, function(err) {
        if(err) {
          return done(err);
        }
        const actualOptions = (requestMock.calls[0] || {})[0] || {};
        const actualHeaders = actualOptions.headers;
        const expectedHeaders = {
          'Accept': 'application/ld+json, application/json'
        };
        for(const k in options.headers) {
          expectedHeaders[k] = options.headers[k];
        }
        assert.deepEqual(actualHeaders, expectedHeaders);
        done();
      });
    });
    /* eslint-enable indent */
  });

  /* eslint-disable indent */
  describe('When built using headers that already contain an Accept header',
    function() {
    const options = {request: requestMock};
    options.headers = {
      'x-test-header-3': 'Third value',
      'Accept': 'video/mp4'
    };

    it('constructing the document loader should fail', function(done) {
      const expectedMessage =
        'Accept header may not be specified as an option; ' +
        'only "application/ld+json, application/json" is supported.';
      assert.throws(
        jsonld.useDocumentLoader.bind(jsonld, documentLoaderType, options),
        function(err) {
          assert.ok(
            err instanceof RangeError, 'A range error should be thrown');
          assert.equal(err.message, expectedMessage);
          return true;
        });
      done();
    });
  });
  /* eslint-enable indent */
});
