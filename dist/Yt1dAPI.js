"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
class Yt1dAPI {
    constructor() {
        this.puppeteerOptions = {
            args: ['--no-sandbox']
        };
    }
    async getDownloadLink(videoLink) {
        let browser;
        try {
            browser = await puppeteer_1.default.launch(this.puppeteerOptions);
        }
        catch (browserLaunchError) {
            throw browserLaunchError;
        }
        try {
            const pages = await browser.pages();
            const page = pages.length > 0 ? pages[0] : await browser.newPage();
            await page.goto('https://yt1d.com');
            const urlInputSelector = '#txt-url';
            await page.waitForSelector(urlInputSelector);
            const inputSuccess = await page.evaluate((urlInputSelector, videoLink) => {
                const urlInputElement = document.querySelector(urlInputSelector);
                if (!urlInputElement) {
                    return false;
                }
                urlInputElement.value = videoLink;
                return true;
            }, urlInputSelector, videoLink);
            if (!inputSuccess) {
                await browser.close();
                throw Error('Filling input failed');
            }
            const submitButtonSelector = '#btn-submit';
            await page.waitForSelector(submitButtonSelector);
            await page.click(submitButtonSelector);
            await page.waitForTimeout(2000);
            await page.evaluate(() => {
                window.scrollTo(0, 700);
            });
            await page.waitForTimeout(3000);
            const q1080pButtonSelector = 'button[data-fquality="128"][data-ftype="mp4"]';
            try {
                await page.waitForSelector(q1080pButtonSelector, { timeout: 5000 });
            }
            catch (e) {
                // Try clicking again
                await page.evaluate(() => {
                    window.scrollTo(0, 200);
                });
                await page.waitForTimeout(2000);
                await page.click(submitButtonSelector);
                await page.evaluate(() => {
                    window.scrollTo(0, 700);
                });
                await page.waitForSelector(q1080pButtonSelector);
            }
            let tries = 3;
            let finished = false;
            let clickError = null;
            while (tries > 0 && finished === false) {
                try {
                    await page.click(q1080pButtonSelector);
                    finished = true;
                }
                catch (e) {
                    tries--;
                    clickError = e;
                    await page.waitForTimeout(10000);
                }
            }
            if (!finished) {
                if (!clickError) {
                    clickError = Error('Error while clicking');
                }
                await browser.close();
                throw clickError;
            }
            await page.waitForTimeout(3000);
            const downloadNowButtonSelector = '#A_downloadUrl';
            await page.waitForSelector(downloadNowButtonSelector);
            const downloadUrl = await page.evaluate((downloadNowButtonSelector) => {
                const downloadNowButtonElement = document.querySelector(downloadNowButtonSelector);
                if (!downloadNowButtonElement) {
                    return null;
                }
                const downloadNowButtonHref = downloadNowButtonElement.href;
                if (!downloadNowButtonHref) {
                    return null;
                }
                return downloadNowButtonHref;
            }, downloadNowButtonSelector);
            if (!downloadUrl) {
                await browser.close();
                throw Error('No Download URL found');
            }
            await browser.close();
            return downloadUrl;
        }
        catch (puppeteerError) {
            await browser.close();
            throw puppeteerError;
        }
    }
}
exports.default = Yt1dAPI;
