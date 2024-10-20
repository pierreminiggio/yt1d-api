import Yt1dAPI from './Yt1dAPI';

(async() => {
    const api = new Yt1dAPI()
    api.puppeteerOptions.headless = false

    const downloadLink = await api.getDownloadLink('https://www.youtube.com/watch?v=4kU2l9W_z_E')
    console.log(downloadLink)
})()
