/*
* Carry out a Google Search
*/

"use strict";
var assert = require("assert");
var webdriver = require('selenium-webdriver');
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
    assert.equal("success", "success", "Socrata API Call returns success");
    browser.quit();
}

browser.get('http://localhost:51611/microsite/usdot_data_microsite_template.html');
browser.findElement(webdriver.By.id('mainSearch')).sendKeys('field test');
browser.findElement(webdriver.By.className('searchButton')).click();
browser.wait(findTutsPlusLink, 2000);


describe("First Test Suite", function () {
    describe("Page Title Loaded", function () {
        it("test page title load", function () {
            browser.findElement(webdriver.By.className('searchHeaderText')).getText().then(function (text) {
                console.log(text);
                expect(text).to.equal("EXPLORE OUR DATA - Beta Version")
            });
        });
    });
});


closeBrowser();