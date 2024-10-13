import Yt1dAPI from './Yt1dAPI';

const args = process.argv
const argsLength = args.length

if (argsLength < 3) {
    console.log('Use like this : node dist/cli.js <youtubeVideoLink>')
    process.exit()
}

const link = args[2];

(async() => {
    const api = new Yt1dAPI()

    const downloadLink = await api.getDownloadLink(link)
    console.log(downloadLink)
})()
