#!/bin/bash

sudo docker-compose down

cd container
sudo docker build -t twaldin/terminal-portfolio:latest . --no-cache
cd ..
sudo docker-compose up -d --build --force-recreate
