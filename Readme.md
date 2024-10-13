# Smooth Images

API Documentation
[Postman API docs](https://github.com/sourabhmandal/smooth-images/blob/main/readme-resources/Image-processing%20API%20Docs.postman_collection.json)

# How to start the server

I have added a docker compose file with all the dependencies of app

Due to issues with sharp library I am not able to build and run the app with docker-compose. Hence we have two step process of running the app

1. Install Dev dependencies - `npm install`
2. Run the Docker compose file - `docker compose up -d`
3. Run the node.js app - `npm run dev`

# High Level Design

![High level Design - Smooth Images](https://raw.githubusercontent.com/sourabhmandal/smooth-images/refs/heads/main/readme-resources/hld.svg)