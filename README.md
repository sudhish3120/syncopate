# Syncopate

Create an `.env` file in `backend/` like this

```
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
TICKETMASTER_KEY=<Ticketmaster Key>
TICKETMASTER_SECRET=<Ticketmaster Secret>
TICKETMASTER_URL_BASE=https://app.ticketmaster.com/discovery/v2/
```

### Commands need to be run from root directory

#### Start or stop backend and postgres

`make up`
`make down`

#### Run makemigrations and migrate

`make makemigrations`
`make migrate`

#### If you can't run any of the make commands

`xcode-select --install` in terminal

#### Pylint Commands

`make setup-python`
`make lint-python`
`make clean`

#### Frontend stuff

```
cd client
npm install
npm run dev
```

#### Eslint Commands

```
cd client
npm run lint
```

Next.js should be running on http://localhost:3000/
Django backend should be on http://localhost:8000/
