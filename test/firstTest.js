var assert = require('assert');
var client = require('webdriverio').remote({
    desiredCapabilities: {
        browserName: 'phantomjs'
    }
}).init();

describe('example', function () {
    before(function (done) {
        client.url('http://localhost:9000/microsite/usdot_data_microsite_template.html', done);
    });

    it('tests a feature', function (done) {
        client
          .getTitle(function (err, title) {
              assert.equal(title, 'Example');
          })
          .call(done);
    });

    after(function (done) {
        client.end(done);
    });
});