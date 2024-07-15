import express from 'express'
import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SQLITE_PATH = process.env.SQLITE_FILE ?? './';
const app = express();
const port = 3000;

const db = new sqlite3.Database(path.resolve(__dirname, SQLITE_PATH, 'redirects.sqlite3'), sqlite3.OPEN_READONLY);

async function getCommonsId(invenioId) {
    return new Promise((resolve, reject) => {
        db.get("SELECT commons_id FROM records WHERE invenio_recid = ?", [invenioId], (err, row) => {
            if (err) {
                resolve(null);
            }
            resolve(row.commons_id ?? null);
        })
    })
}

app.get('/records/:invenioId', async (req, res) => {
    const invenioId = req.params.invenioId;
    const commonsId = await getCommonsId(invenioId);
    if (commonsId) {
        res.redirect(`https://hcommons.org/deposits/item/${commonsId}/`)
    } else {

        res.status(404);
    }
});

app.get('*', (req, res) => {
    res.status(404);
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})
