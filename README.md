# Triptastic

An app to help manage your trip! You can add stops, pictures, notes, and a full route of your trip! Lots of plans for this to expand and is currently not stable enough for release.


## Architecture

Triptastic app is built using a combination of technologies including PostgreSQL, Node.js, MikroORM, Nest.js, Parcel, React, and Tailwind CSS.

### Backend

The backend of the app is powered by Node.js and [Nest.js](https://nestjs.com). The data persistence layer is handled by PostgreSQL. MikroORM is used as an ORM, for seeding, and migrations. The frontend of the app is built using React. Parcel is used as the bundler. Tailwind CSS is utilized as the CSS framework.


## Getting started

Create a .env file and make sure you have a postgres database running. You will eventually need a stadia key if you choose to use the current map in production.


## Commands

`npm run serve` - serves the API and UI. Access the site through localhost:1234
`npm run serve:ui` - serves the UI only on port 1234. Proxies `/api` requests to localhost:5000
`npm run serve:api` - serves the API only on port 5000. Serves static content from `dist/ui`
`npm run build` - builds the UI and the API
`npm run build:ui` - builds the UI and outputs to `dist/ui`
`npm run build:api` - builds the API and outputs to `dist/api`. This is required to run `npm start`
`npm test` - runs `jest` in ci mode with coverage
`npm start` - runs `node dist/api/main`

