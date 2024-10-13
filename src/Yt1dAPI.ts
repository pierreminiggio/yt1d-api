import puppeteer, { Browser, BrowserConnectOptions, BrowserLaunchArgumentOptions, LaunchOptions, Page, Product } from 'puppeteer'

type PuppeteerOptions = LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions & {
    product?: Product;
    extraPrefsFirefox?: Record<string, unknown>;
}

export default class Yt1dAPI {

    public puppeteerOptions: PuppeteerOptions = {
        args: ['--no-sandbox']
    }

    async getDownloadLink(videoLink: string): Promise<string>
    {
        let browser: Browser

        try {
            browser = await puppeteer.launch(this.puppeteerOptions)
        } catch (browserLaunchError: any) {
            throw browserLaunchError;
        }

        try {
            const pages = await browser.pages()
            const page = pages.length > 0 ? pages[0] : await browser.newPage()

            await page.goto('https://yt1d.com')

            const urlInputSelector = '#txt-url'
            await page.waitForSelector(urlInputSelector)

            const inputSuccess = await page.evaluate((urlInputSelector: string, videoLink: string): boolean => {
                const urlInputElement = document.querySelector(urlInputSelector) as HTMLInputElement|null

                if (! urlInputElement) {
                    return false
                }

                urlInputElement.value = videoLink

                return true
            }, urlInputSelector, videoLink)

            if (! inputSuccess) {
                await browser.close()
                throw Error('Filling input failed')
            }

            const submitButtonSelector = '#btn-submit'
            await page.waitForSelector(submitButtonSelector)
            await page.click(submitButtonSelector)

            await page.waitForTimeout(2000)

            await page.evaluate(() => {
                window.scrollTo(0, 700);
              });

            await page.waitForTimeout(3000)

            const q1080pButtonSelector = 'button[data-fquality="128"][data-ftype="mp4"]'
            await page.waitForSelector(q1080pButtonSelector)

            let tries = 3
            let finished: boolean = false
            let clickError: Error|null = null

            while (tries > 0 && finished === false) {
                try {
                    await page.click(q1080pButtonSelector)
                    finished = true
                } catch (e: any) {
                    tries--
                    clickError = e
                    await page.waitForTimeout(10000)
                }
            }

            if (! finished) {
                if (! clickError) {
                    clickError = Error('Error while clicking')
                }
                
                await browser.close()
                throw clickError
            }
            

            await page.waitForTimeout(3000)

            const downloadNowButtonSelector = '#A_downloadUrl'
            await page.waitForSelector(downloadNowButtonSelector)

            const downloadUrl = await page.evaluate((downloadNowButtonSelector: string): string|null => {
                const downloadNowButtonElement = document.querySelector(downloadNowButtonSelector) as HTMLLinkElement|null

                if (! downloadNowButtonElement) {
                    return null
                }

                const downloadNowButtonHref = downloadNowButtonElement.href

                if (! downloadNowButtonHref) {
                    return null
                }

                return downloadNowButtonHref
            }, downloadNowButtonSelector)

            if (! downloadUrl) {
                await browser.close()
                throw Error('No Download URL found')
            }

            await browser.close()

            return downloadUrl
        } catch (puppeteerError: any) {
            await browser.close()
            throw puppeteerError;
        }
    }
}
