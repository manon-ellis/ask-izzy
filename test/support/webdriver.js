/* @flow */

import Webdriver from "selenium-webdriver";

declare var IzzyStorage: Object;

export async function seleniumBrowser(
    driver: Webdriver.WebDriver,
): Promise<Object> {
    const wnd = new Webdriver.WebDriver.Window(driver);
    const capabilities = await driver.getCapabilities();
    const res = capabilities.caps_;

    res.version = res.version || res.platformVersion;

    try {
        const { width, height } = await wnd.getSize();

        res.width = width;
        res.height = height;
    } catch (error) {
        // Width and height aren't supported on android
        res.width = 0;
        res.height = 0;
    }

    return res;
}

/**
 * Gets the base URL for this session
 *
 * @return {string} - Root url for the application under test.
 */
export function baseUrl(): string {
    const port = process.env.PORT || 8000;

    return process.env.IZZY_TEST_URL || `http://localhost:${port}`;
}

/**
 * Visit the given URL on the running Express server.
 *
 * @param {Webdriver.Webdriver} driver - Selenium webdriver.
 * @param {string} url - URL to visit.
 *
 * @return {Promise} - return value from Selenium Webdriver.get.
 */
export function gotoUrl(
    driver: Webdriver.WebDriver,
    url: string
): Promise<void> {
    return driver.get(baseUrl() + url);
}

/**
 * Build a webdriver.
 *
 * @return {Promise<Webdriver.Webdriver>} requested webdriver.
 */
export default async function webDriverInstance(
): Promise<Webdriver.WebDriver> {
    // Remove version from browserName (not supported)
    const browserName = (process.env.SELENIUM_BROWSER || "").split(/:/)[0];

    const driver = new Webdriver.Builder()
        /* Default to using phantom.js if `SELENIUM_BROWSER` not provided. */
        .forBrowser(browserName || "phantomjs")
        .build();

    await driver
        .manage()
        .timeouts()
        .implicitlyWait(10000);

    return driver;
}

async function waitForStorage(
    driver: Webdriver.WebDriver,
): Promise<void> {
    await gotoUrl(driver, "/");
    await driver.wait(() =>
        driver.executeScript(() =>
            typeof IzzyStorage != "undefined"
        ),
        10000
    );
}

export async function setStorage(
    driver: Webdriver.WebDriver,
    value: string,
): Promise<void> {
    await waitForStorage(driver);
    await driver.executeScript((value) =>
        IzzyStorage.setItem(value), value
    )
}

export async function cleanDriverSession(
    driver: Webdriver.WebDriver
): Promise<void> {
    await waitForStorage(driver);
    await driver.executeScript(() => {
        IzzyStorage.clear();
        window.dataLayer = [];
    });
}
