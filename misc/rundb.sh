#!/bin/bash

# WARNING: This script will stop and kill any previously created
# containers every time it is ran. You will loose your data!

echo "\nStopping affected containers"
docker stop seneca_msg_stats_db

echo "\nRemoving affected containers"
docker rm seneca_msg_stats_db

echo "\nGathering image"
docker pull tutum/influxdb@0.9

echo "\nRunning Influx"
docker run -d -p 8083:8083 -p 8086:8086 --expose 8090 --expose 8099 --name "seneca_msg_stats_db" tutum/influxdb@0.9
docker exec -ti seneca_msg_stats_db /opt/influxdb/influx
