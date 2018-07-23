import {getSpritesheetUrls, getImages} from './lib/get_urls';

const DATA_DIRECTORY = './data';

async function main(): Promise<void> {
    const still_urls = await getSpritesheetUrls('./export.json');
    await getImages(DATA_DIRECTORY, still_urls);
}

main().then(() => console.log('complete')).catch(err => console.log(err));
