<p align="center">
  <a href="https://nodejs.org/en/" target="blank"><img src="./documentationAsset/Street_Fighter_old_logo.png" width="320" alt="NodeJS Logo" /></a>
</p>


  <p align="center"> Epitech global nomade track angular project </p>

  <p align="center"> A multiplayer (online) version of “Street fighter” with <a href="https://angular.io/" target="_blank">Angular</a> as frontend and a backend built with <a href="http://nodejs.org" target="_blank">Node.js</a> </p>


## Description

Students will have to build a multiplayer (online) version of “Street fighter” with Angular as a frontend. The website will have all the functionality of a multiplayer game:

- account management
- a matching system
- a ranking system
- a hall of fame
- a fighting room ( a chat system must be included in the room so the opponents can exchange messages)
- a training room
- a friendship system

During the fight, players will have the possibility to:

- Move frontward and backward
- Jump and crouch
- Attach with hands and feets
- Throw fire ball

A health and damage management system must be setup by the students.

## Disclaimer MacOS arm64

If you have a Mac running on arm64 ( with a m1 chipset for example ) please follow the following step to install/run the project

```
1) Right click the app (Terminal, iTerm, etc.)
2) Tap "Get Info"
3) Select "Open using Rosetta"
4) Restart terminal and you're good to go!
```

## Version

``nvm use 12.20.2``

## Installation


```bash
 $ npm install
```

# Database

To synchronize the database with the latest Prisma schema, please use:
```shell
$ npx prisma generate --schema=./prisma/schema.prisma
$ npx prisma migrate dev --schema=./prisma/schema.prisma --name init
```
It will create the database and tables if necessary. Otherwise, Prisma generates internal JS files to work with the CLI that we use. You can find it in `./src/server/database.ts`.


## Dotenv

Create a .env file copy ``.env.example`` and fill the blank with your information

## Running the app

### Frontend:

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

```

## Collaborator

[Clement SCHMITTE](clement.schmitte@epitech.eu)

[Mai-ly LEHOUX](mai-ly.lehoux@epitech.eu)

[Clement RUFFINONI](clement.ruffinoni@epitech.eu)

[Alexis WALTER](alexis.walter@epitech.eu)


### If you have any trouble to run/use the project please contact one of us.
