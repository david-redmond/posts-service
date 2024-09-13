# images-service

## Description
A service that can be used to create, get and delete images.

## Dependencies
It needs a PORT env variable - defaults to :8012
It needs a PUBLIC_URL env variable to make up the public get URL for the images

## Endpoints
It needs 3 endpoints

1) **POST /** - This is used to upload a new image or an array of images.

2) **DELETE /** - This is used to delete a single image using the filename.

## Build
Run `docker build -t <name> .`

## Development
To build `npm run build`

To run `npm start`
