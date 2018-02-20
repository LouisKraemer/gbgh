#!/usr/bin/python3

from pymongo import MongoClient
from pymongo import GEOSPHERE
from bson.objectid import ObjectId
import requests
import datetime
import time
import logging

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s %(name)-12s %(levelname)-8s %(message)s',
                    datefmt='%m-%d %H:%M',
                    filename='/tmp/getVelovs.log',
                    filemode='a')

client = MongoClient("localhost:27017")
db=client.gbgh

now=datetime.datetime.now()
timestamp = now.strftime("%s")

####################################
# insertion de la partie statique
####################################

if "staticVelov" not in db.collection_names():
    db.staticVelov.create_index([("geometry", GEOSPHERE)])

    r = requests.get("https://download.data.grandlyon.com/wfs/grandlyon"+
        "?SERVICE=WFS"+
        "&VERSION=2.0.0"+
        "&outputformat=GEOJSON"+
        "&maxfeatures=400"+
        "&request=GetFeature"+
        "&typename=pvo_patrimoine_voirie.pvostationvelov"+
        "&SRSNAME=urn:ogc:def:crs:EPSG::4171")

    logging.info("static velov http request status code is : %s" % r.status_code)

    for station in r.json()["features"]:
        toInsert = {}
        toInsert["idstation"] = station["properties"]["idstation"]
        toInsert["nom"] = station["properties"]["nom"]
        toInsert["nbbornettes"] = station["properties"]["nbbornettes"]
        toInsert["geometry"] = station["geometry"]

        result = db.staticVelov.insert_one(toInsert)
        logging.info("inserted staticVelovs with id %s" % result.inserted_id)

####################################
# insertion de la partie dynamique
####################################

if "dynamicVelov" not in db.collection_names():
    db.dynamicVelov.create_index('timestamp', unique=True)

r = requests.get("https://download.data.grandlyon.com/wfs/rdata" +
   "?SERVICE=WFS" +
   "&VERSION=2.0.0" +
   "&outputformat=GEOJSON" +
   "&maxfeatures=400" +
   "&request=GetFeature" +
   "&typename=jcd_jcdecaux.jcdvelov" +
   "&SRSNAME=urn:ogc:def:crs:EPSG::4171")

logging.info("dynamic velov http request status code is : %s" % r.status_code)

stationArray = []
for feature in r.json()["features"]:
    toInsertStation = {}
    toInsertStation['idstation'] = feature['properties']['number']
    toInsertStation['available_bikes'] = feature['properties']['available_bikes']
    toInsertStation['available_bike_stands'] = feature['properties']['available_bike_stands']
    stationArray.append(toInsertStation)

toInsert = {'timestamp' : timestamp, "stations" : stationArray}
result = db.dynamicVelov.insert_one(toInsert)

logging.info("Inserted dynamic velovs with ID in database : %s" % result.inserted_id)
