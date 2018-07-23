import * as fs from 'fs';
import * as path from 'path';

import {callAsPromise, callAsVoidPromise, callAsVoidPromise2, callAsVoidPromise3} from './promisify';

export function createWriteStream(filepath: string): Promise<fs.WriteStream> {
    return new Promise((res, rej) => {
        const stream = fs.createWriteStream(filepath);
        stream.on('open', () => {
            res(stream);
        });

        stream.on('error', (err) => {
            rej(err);
        });
    });
}

export function readJson<T>(filepath: string): Promise<T> {
    return new Promise(async (res, rej) => {
        if (!await fileExists(filepath)) {
            rej(new Error(`No file at ${filepath}`));
        }
        
        fs.readFile(filepath, 'utf8', (err, data) => {
            if (err) {
                rej(err);
            }

            try {
                const parsed = JSON.parse(data);
                res(parsed);
            } catch (parseErr) {
                rej(parseErr);
            }
        });
    });
}

export async function isDirectory(filepath: string): Promise<boolean> {
    const stats = await asyncStat(filepath);
    return stats.isDirectory();
}

export function asyncStat(filepath: string): Promise<fs.Stats> {
    return callAsPromise(fs.stat, filepath);
}

export function listDirectoryContents(filepath: string): Promise<string[]> {
    return callAsPromise(fs.readdir, filepath);
}

interface IsDirChild {
    child: string;
    fullPath: string;
    isDir: boolean;
}

async function getChildrenAreDirectories(basePath: string): Promise<IsDirChild[]> {
    const contents = await listDirectoryContents(basePath);

    return await Promise.all(contents.map(child => {
        const fullPath = path.join(basePath, child);
        return new Promise<IsDirChild>((res, rej) => {
            isDirectory(fullPath).then(isDir => {
                res({
                    child,
                    fullPath,
                    isDir,
                });
            })
            .catch(err => rej(err));
        });
    }));
}

export async function getChildDirectories(basePath: string): Promise<string[]> {
    return (await getChildrenAreDirectories(basePath)) 
        .filter(mapped => mapped.isDir)
        .map(mapped => mapped.child);
}

export async function getChildFiles(basePath: string): Promise<string[]> {
    return (await getChildrenAreDirectories(basePath)) 
        .filter(mapped => !mapped.isDir)
        .map(mapped => mapped.child);
}

export function writeFile(filepath: string, data: string): Promise<void> {
    return callAsVoidPromise3(fs.writeFile, filepath, data, 'utf8');
}

export async function deleteFile(filepath: string): Promise<void> {
    if (await fileExists(filepath)) {
        await callAsVoidPromise(fs.unlink, filepath);
    }
}

export function moveFile(source: string, destination: string): Promise<void> {
    return callAsVoidPromise2(fs.rename, source, destination);
}

export function fileExists(filepath: string): Promise<boolean> {
    return new Promise(res => {
        fs.exists(filepath, exists => res(exists));
    });
}

