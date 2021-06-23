const axios = require('axios')
const ethers  = require('ethers');
const fsPromises = require('fs').promises;

const API_URL = 'https://youtube.googleapis.com/youtube/v3/videos';

async function getAPIKey(API_KEY_PATH) {
    let buffer;
    try {
        buffer = await fsPromises.readFile(API_KEY_PATH);
    } catch (e) {
        throw new Error('API key file not found');
    }
    return buffer.toString();
}

(async () => {
    try {
        const iexecIn = process.env.IEXEC_IN || 'iexec_in';
        const iexecOut = process.env.IEXEC_OUT || 'iexec_out';

        if (process.argv.length < 4) {
            throw new Error('Parameters for videoId and content hash are required');
        }
        const id = process.argv[2];
        const hash = process.argv[3];

        const API_KEY = await getAPIKey(`${iexecIn}/key.txt`);
        const args = { part: 'snippet', id: id, key: API_KEY };
        let result = await axios.get(API_URL, { params: args });

        if (result.data.items.length > 0) {
            const snippet = result.data.items[0].snippet;
            const description = snippet.description;
            const validVideoDescription = description.indexOf(hash) >= 0;

            console.log('Video ' + id + ' is valid = ' + validVideoDescription);

            await fsPromises.writeFile(`${iexecOut}/result.txt`, validVideoDescription.toString());
            const iexecCallback = ethers.utils.defaultAbiCoder.encode(
                ['string', 'string', 'bool'], [id, hash, validVideoDescription]);
            const computedJsonObj = {
                'deterministic-output-path': `${iexecOut}/result.txt`,
                'callback-data': `${ethers.utils.keccak256(iexecCallback)}`
            };
            await fsPromises.writeFile(`${iexecOut}/computed.json`, JSON.stringify(computedJsonObj));
        }
        else {
            throw new Error('Video ' + id + ' is not available from YouTube API')
        }
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
