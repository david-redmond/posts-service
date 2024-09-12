# post-service

## Description
A service that can be used to create, edit, get and delete posts data.

## Dependencies
It needs to connect to a mongoDB. This can be specified using the "MONGODB_URI" env var.
It also needs a PORT env variable - defaults to :8011

## Endpoints
It needs 3 endpoints
1) **POST /check** - which returns a user from the database. This is used to verify if the user exists or not.
2) **POST /** - This is used to create a new user on register.
3) **GET /** - This is used to return a user.
4) **PUT /** - This is used to update a user.
5) **DELETE /** - This is used to delete a user.

## Build
Run `docker build -t <name> .`

## Development
To build `npm run build`

To run `npm start`
