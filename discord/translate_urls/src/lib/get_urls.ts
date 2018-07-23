import {createWriteStream, writeFile, readJson, fileExists} from './fs';
import * as fs from 'fs';
import * as uuid from 'uuid';
import * as https from 'https';
import * as path from 'path';
import * as _ from 'lodash';

const DOWNLOADS_PER_SET = 25;

export declare interface ExportFormat {
    [key: string] : Partial<EmoteData>;
}

export declare interface EmoteData {
    css: {
        [key: string]: string;
    };
    image_url: string;
    offset: number[];
    size: number[];
    tags: string[];
}

export declare interface UrlMapping {
    uuid: string;
    filename: string;
    s3Url: string;
    discordUrl: string;
}

export declare interface FailedDownload {
    url: string;
    error: Error;
}

export async function getSpritesheetUrls(filepath: string): Promise<string[]> {
    const readEmotes = await readJson<ExportFormat>(filepath);
        
    return _.chain(readEmotes)
        .map(emote => emote.image_url)
        .compact()
        .uniq()
        .value();
}

export async function readExistingData(dataDirectory: string): Promise<UrlMapping[]> {
    const mappingsPath = path.join(dataDirectory, 'mappings.json');
    if (!await fileExists(mappingsPath)) {
        return [];
    }
    return await readJson<UrlMapping[]>(path.join(dataDirectory, 'mappings.json'));
}

export async function writeMappings(dataDirectory: string, mappings: Partial<UrlMapping>[]): Promise<void> {
    const filepath = path.join(dataDirectory, 'mappings.json');
    const serializedData = JSON.stringify(mappings, null, 2);

    await writeFile(filepath, serializedData);
}

export async function getImages(dataDirectory: string, imageUrls: string[]): Promise<Partial<UrlMapping>[]> {
    const existingData = await readExistingData(dataDirectory);
    const existingDataUrls = _.mapKeys(existingData, datum => datum.s3Url);
    const neededImages = imageUrls.filter(url => !existingDataUrls[url]);
    
    const chunkedRequestUrls = _.chunk(neededImages, DOWNLOADS_PER_SET);
    const successfulUrls: Partial<UrlMapping>[] = [];
    const failedUrls: string[] = [];
    
    for (const urlSet of chunkedRequestUrls) {
        console.log('Requesting: ');
        console.log(urlSet);
        const mappedRequests = urlSet.map(url => 
            getImage(dataDirectory, url)
                .then(mapping => successfulUrls.push(mapping))
                // Don't swallow this error
                .catch(err => { 
                   console.log(err); 
                    failedUrls.push(url);
                })
        );
       
        await Promise.all(mappedRequests);
    }
    
    console.log('failed: ');
    console.log(failedUrls);
    
    const newData = [...existingData, ...successfulUrls];

    await writeMappings(dataDirectory, newData);

    return newData;
}

function getImage(dataDirectory: string, imageUrl: string): Promise<Partial<UrlMapping>> {
    return new Promise(async (res, rej) => {
        let id = uuid.v4(); 
        let filename = `${id}${path.extname(imageUrl)}`;
        let newFilePath = path.join(dataDirectory, filename);
        
        // Just try again once.  If we get two UUID collisions in a row, consider
        // buying a lottery ticket.
        if (await fileExists(newFilePath)) {
            console.log('UUID collision for ' + id);
            id = uuid.v4(); 
            filename = `${id}${path.extname(imageUrl)}`;
            newFilePath = path.join(dataDirectory, filename);
        }
        
        const newFile = await createWriteStream(newFilePath);

        https.get(imageUrl, (response) => {
            if (response.statusCode !== 200) {
                rej(new Error('Status code was not 200'));        
            }
            
            response.pipe(newFile);

            response.on('end', () => {
                newFile.close();
                res({
                    uuid: id,
                    filename,
                    s3Url: imageUrl,
                });
            });
        }).on('error', (err) => {
            newFile.close();
            fs.unlink(newFilePath, () => {
                rej(err);   
            });
        });
    });
}
