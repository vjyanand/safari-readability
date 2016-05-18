var fs = require('fs');
var path = require('path');
var webdriver = require('selenium-webdriver');
var chromeCapabilities = webdriver.Capabilities.chrome();
var chromeOptions = {
  'args': ['--test-type', '--start-maximized', '--allow-running-insecure-content', '--disable-web-security']
};

chromeCapabilities.set('chromeOptions', chromeOptions);

module.exports = function(url, cb) {
  var fResult = {};
  fs.readFile(path.resolve(__dirname, 'safari.js'), 'utf8', function(error, safariJS) {
    if (error) {
      return cb(error);
    }

    var driver = new webdriver.Builder()
      .usingServer('http://localhost:4444/wd/hub')
      .withCapabilities(chromeCapabilities).build();
    try {
      driver.get(url);
      driver.executeAsyncScript(function(js, _cb) {
        eval(js);
        if (ReaderArticleFinderJS.isReaderModeAvailable()) {
          var article = ReaderArticleFinderJS.adoptableArticle();
          var title = ReaderArticleFinderJS.articleTitle();
          return _cb({
            'body': article.outerHTML,
            'title': title
          });
        }
        return _cb({});
      }, safariJS).then(function(result) {
        result.url = url;
        fResult = result;
      });
    } catch (err) {
      console.log("DRIVER QUIT ON ERROR:");
    }

    driver.quit().then(function() {
      console.log("DRIVER QUIT SUCCESS:");
      return cb(fResult);
    });

  });
}
