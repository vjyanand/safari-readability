var fs = require('fs');
var path = require('path');
var webdriver = require('selenium-webdriver');
var chromeCapabilities = webdriver.Capabilities.chrome();
var chromeOptions = {
  'args': ['--test-type', '--headless', '--disable-gpu', '--start-maximized', '--allow-running-insecure-content', '--disable-web-security', '--incognito', 'user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36"']
};

chromeCapabilities.set('chromeOptions', chromeOptions);
chromeCapabilities.set('unexpectedAlertBehavior', 'dismiss');

module.exports = function(url, cb) {
  var finalResult = {};
  fs.readFile(path.resolve(__dirname, 'safari.js'), 'utf8', function(error, safariJS) {
    if (error) {
      return cb(error);
    }

    var driver = new webdriver.Builder().withCapabilities(chromeCapabilities).build();

    driver.manage().timeouts().setScriptTimeout(120000);
    driver.manage().timeouts().pageLoadTimeout(60000);

    try {
      driver.get(url);
      driver.executeAsyncScript(function(jsCode, _cb) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.text = jsCode;
        head.appendChild(script);
        if ("undefined" != typeof ReaderArticleFinderJS && ReaderArticleFinderJS.isReaderModeAvailable()) {
          var article = ReaderArticleFinderJS.adoptableArticle();
          var title = ReaderArticleFinderJS.articleTitle();
          return _cb({
            'body': article.outerHTML,
            'title': title
          });
        }
        return _cb({
          'err': true
        });
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
};
