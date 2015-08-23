/*
 * Step definitions for Selenium/browser related steps
 */

"use strict";

import assert from '../support/page-assertions';
import Url from 'url';
import Yadda from 'yadda';
import readline from 'readline';
import unpromisify from "../support/yadda-promise";
import { By } from 'selenium-webdriver';

module.exports = (function() {
    return Yadda.localisation.English.library()
        .when('I visit $URL', unpromisify(visitUrl))
        .when('I click on "$STRING"', unpromisify(clickLink))
        .when('I pause for debugging', unpromisify(pauseToDebug))
        .then('I should be at $URL', unpromisify(checkURL))
        .then('I should see "$STRING"', unpromisify(thenISee));
})();

async function visitUrl(url) {
    var port = process.env.PORT || 8000;
    return this.driver.get(`http://localhost:${port}${url}`);
}

async function clickLink(link) {
    var element = await this.driver.findElement(By.xpath(
        /* any 'a' element who has a descendent text node containing
         * the link text */
        `//a[normalize-space(.//text()) = normalize-space('${link}')]`
    ));

    await element.click();
}

function pauseToDebug() {
    return new Promise((resolve, reject) => {
        console.log("Paused. Press any key to continue...");
        var stdin = process.stdin;

        stdin.setRawMode(true);
        stdin.on('data', (key) => {
            stdin.setRawMode(false);
            if (key === '\u0003') {  // Ctrl-C
                reject();
            } else {
                resolve();
            }
        });
    });
}

async function checkURL(expected) {
    var browserPath = Url.parse(await this.driver.getCurrentUrl()).path;

    assert.equal(browserPath, expected);
}

async function thenISee(expected) {
    await assert.textIsVisible(this.driver, expected);
}
