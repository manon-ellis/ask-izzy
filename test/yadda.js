/*
 * Enable Yadda in Mocha
 */
"use strict";

import Yadda from 'yadda';
import Webdriver from 'selenium-webdriver';
import fs from 'fs';

Yadda.plugins.mocha.StepLevelPlugin.init();

import libraries from './steps/steps';

import _ from '../src/server';

new Yadda.FeatureFileSearch('./test/features').each(file => {
    featureFile(file, feature => {
        var driver;

        before(function(done) {
            /* increase the timeout to set up Selenium */
            this.timeout(30000);

            executeInFlow(() => {
                let branch = process.env.TRAVIS_BRANCH || "Manual";

                driver = new Webdriver.Builder()
                    /* These are used by Sauce Labs
                     * You should also pass SELENIUM_REMOTE_URL to connect
                     * via Selenium Grid */
                    .withCapabilities({
                        username: process.env.SAUCE_USERNAME,
                        accessKey: process.env.SAUCE_ACCESS_KEY,
                        name: "Ask Izzy " + branch,
                        tags: [
                            process.env.TRAVIS_PULL_REQUEST || "Manual",
                            branch,
                        ],
                        build: process.env.TRAVIS_BUILD_NUMBER || "Manual",
                        tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
                    })
                    /* This is the default. Overridden by SELENIUM_BROWSER */
                    .forBrowser('firefox')
                    .build();

                driver.manage().timeouts().implicitlyWait(10000);
            }, done);
        });

        scenarios(feature.scenarios, scenario => {
            steps(scenario.steps, (step, done) => {
                executeInFlow(() => {
                    Yadda.createInstance(libraries, {
                        driver: driver,
                    }).run(step);
                }, done);
            });
        });

        /* IMPORTANT: needs the correct 'this' */
        afterEach(function() {
            this.timeout(30000);
            takeScreenshotOnFailure(this.currentTest, driver);
        });

        after(done => {
            driver.quit().then(done);
        });
    });
});

function executeInFlow(fn, done) {
    Webdriver.promise.controlFlow().execute(fn).then(function() {
        done();
    }, done);
}

function takeScreenshotOnFailure(test, driver) {
    if (test.state != 'passed') {
        var path = test.title.replace(/\W+/g, '_').toLowerCase() + '.png';

        driver.takeScreenshot().then(function(data) {
            fs.writeFileSync(path, data, 'base64');
        });
    }
}
