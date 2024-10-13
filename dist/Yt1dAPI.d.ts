import { BrowserConnectOptions, BrowserLaunchArgumentOptions, LaunchOptions, Product } from 'puppeteer';
declare type PuppeteerOptions = LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions & {
    product?: Product;
    extraPrefsFirefox?: Record<string, unknown>;
};
export default class Yt1dAPI {
    puppeteerOptions: PuppeteerOptions;
    getDownloadLink(videoLink: string): Promise<string>;
}
export {};
