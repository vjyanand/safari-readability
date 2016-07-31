var fs = require('fs');
var path = require('path');
var webdriver = require('selenium-webdriver');
var crypto = require('crypto');
var chromeCapabilities = webdriver.Capabilities.chrome();
var chromeOptions = {
  'args': ['--test-type', '--start-maximized', '--allow-running-insecure-content', '--disable-web-security']
};

chromeCapabilities.set('chromeOptions', chromeOptions);

module.exports = function(url, cb) {
  var finalResult = {};
  fs.readFile(path.resolve(__dirname, 'safari.js'), 'utf8', function(error, safariJS) {
    if (error) {
      return cb(error);
    }

    var driver = new webdriver.Builder()
      .withCapabilities(chromeCapabilities).build();
    try {
      driver.get(url);
      driver.executeAsyncScript(function(js, _cb) {
        eval(js);
        if (ReaderArticleFinderJS && ReaderArticleFinderJS.isReaderModeAvailable()) {
          var article = ReaderArticleFinderJS.adoptableArticle();
          var title = ReaderArticleFinderJS.articleTitle();
          return _cb({
            'body': article.outerHTML,
            'title': title
          });
        }
        return _cb({'err': true});
      }, safariJS).then(function(result) {
        result.url = url;
        finalResult = result;
      });
    } catch (err) {
      console.log("Driver quit on error");
    }

    driver.quit().then(function() {
      console.log("Driver quit on success");
      return cb(finalResult);
    });
  });
}
