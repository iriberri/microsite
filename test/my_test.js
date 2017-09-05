const mochaTimeout = 30000; // ms

var webdriver = require('selenium-webdriver');
var test = require('selenium-webdriver/testing');
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var until = webdriver.until;

var browser = new webdriver.Builder().usingServer().withCapabilities({ 'browserName': 'chrome' }).build();

function logTitle() {
    console.log(browser.findElement(webdriver.By.id('resultsCount')).getText());
}

function clickLink(link) {
    link.click();
}

function handleFailure(err) {
    console.error('Something went wrong\n', err.stack, '\n');
    closeBrowser();
}

function findTutsPlusLink() {
    return browser.findElements(webdriver.By.css('[href="http://code.tutsplus.com/"]'));
}

function closeBrowser() {
    browser.quit();
}

browser.get('http://localhost:51611/microsite/usdot_data_microsite_template.html');
//browser.findElement(webdriver.By.id('mainSearch')).sendKeys('field test');
//browser.findElement(webdriver.By.className('searchButton')).click();
//browser.wait(findTutsPlusLink, 2000);


test.describe("Test Suite", function () {
    this.timeout(mochaTimeout);
    test.describe("Page Load Components", function () {
        test.it("Title Loaded", function () {
            browser.wait(until.elementLocated(webdriver.By.className('searchHeaderText')));

            browser.findElement(webdriver.By.className('searchHeaderText')).getText().then(function (text) {
                expect(text).to.deep.equal("EXPLORE OUR DATA - Beta Version");
            });
        });
        test.it("Contact Email Loaded", function () {
            browser.wait(until.elementLocated(webdriver.By.id('contactEmail')));

            browser.findElement(webdriver.By.id('contactEmail')).getText().then(function (text) {
                expect(text).to.deep.equal("data.itsjpo@dot.gov");
            });
        });
        test.it("Categories Loaded", function () {
            browser.wait(until.elementLocated(webdriver.By.id('bterm0')));

            browser.findElement(webdriver.By.id('bterm0')).then(function (text) {
                expect(text).to.exist;
            });
        });
        test.it("Datasets Loaded", function () {
            browser.wait(until.elementLocated(webdriver.By.id('fds0')));

            browser.findElement(webdriver.By.id('fds0')).then(function (text) {
                expect(text).to.exist;
            });
        });
    });

    test.describe("Search Related Components", function () {
        test.it("Search Submitted", function () {
            browser.findElement(webdriver.By.id('mainSearch')).sendKeys('research results');
            browser.findElement(webdriver.By.className('searchButton')).click();

            browser.findElement(webdriver.By.id('resultsQuery')).getText().then(function (text) {
                expect(text).to.equal("research results");
            });
        });
        test.it("NTL Results Available", function () {
            browser.findElement(webdriver.By.className('resultsCount')).getText().then(function (text) {
                expect(parseInt(text)).to.be.above(23);
            });
        })
    });
});