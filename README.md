# KC Works Transition Redirector

This is a fairly simple container for redirecting users from kcworks
imported links to legacy urls while the migration is in process.

## Envionment Variables

- SQLITE_PATH: Path to the location to store the sqlite DB. Should be a folder that is mapped to a volume for persistence.
- JSON_FILE: Path to the JSON file to read. Should be mapped from the migration process.

## Container default entrypoint

The default entrypoint for the container starts an express server on port :3000 that will listen for requests, lookup in the SQLITE Db, and generate a redirect if the ID exists in the database.

## Importer entrypoint

The command `["npm", "run", "importer.js"]` will start the importer script. This script parses the JSON file and UPSERTS each record into the SQLITE database. The script will then watch for changes and re-run the import.

If the import fails at any point (malformed json, etc) the container will die. This is to allow for direct access to the error message for debuging and to allow the orchestrator to handle restarting the container to re-attempt.
