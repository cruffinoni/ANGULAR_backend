# Database

To synchronize the database with the latest Prisma schema, please use:
```shell
$ npx prisma generate --schema=./prisma/schema.prisma
$ npx prisma migrate dev --schema=./prisma/schema.prisma --name init
```
It will create the database and tables if necessary. Otherwise, Prisma generates internal JS files to work with the CLI that we use. You can find it in `./src/server/database.ts`.
