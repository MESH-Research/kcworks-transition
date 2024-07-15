import parser from 'stream-json';
import StreamArray from 'stream-json/streamers/StreamArray.js';
import Chain from 'stream-chain';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const SQLITE_PATH = process.env.SQLITE_PATH ?? './';
const JSON_FILE = process.env.JSON_FILE ?? 'records.json';



const db = new sqlite3.Database(path.resolve(__dirname, SQLITE_PATH, 'redirects.sqlite3'), sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS records (invenio_recid TEXT PRIMARY KEY, commons_id TEXT)");
})

async function getCount() {
    return new Promise((resolve, reject) => {
        db.get("SELECT COUNT(*) as count from records", (err, row) => {
            if (err) {
                reject(err);
            }
            resolve(row.count);
        })
    })
}

async function importJson(filePath) {

    const pipeline = new Chain([
        fs.createReadStream(JSON_FILE),
        parser(),
        new StreamArray(),
    ]);

    for await (const { value } of pipeline) {
        await db.run("INSERT INTO records (invenio_recid, commons_id) VALUES (?, ?) ON CONFLICT(invenio_recid) DO NOTHING", [value.invenio_recid, value.commons_id]);
    }
    console.log("Import complete, %i records total", await getCount());
}

const jsonFile = path.resolve(JSON_FILE);

console.log("Importing JSON file");
await importJson(jsonFile);
console.log("Watching for JSON file changes.")

fs.watchFile(jsonFile, async () => {
    console.log("JSON file changed, re-importing");
    await importJson(jsonFile);
})
