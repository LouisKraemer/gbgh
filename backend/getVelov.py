#!/usr/bin/python3

from pymongo import MongoClient
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
db.velovs.create_index('timestamp', unique=True)

now=datetime.datetime.now()
timestamp = now.strftime("%s")

r = requests.get("https://download.data.grandlyon.com/wfs/rdata" +
   "?SERVICE=WFS&VERSION=2.0.0" +
   "&outputformat=GEOJSON" +
   "&maxfeatures=30" +
   "&request=GetFeature" +
   "&typename=jcd_jcdecaux.jcdvelov" +
   "&SRSNAME=urn:ogc:def:crs:EPSG::4171")

logging.info("http request status code is : %s" % r.status_code)

toInsert = {"timestamp" : timestamp, "geoJson" : r.json()}
result = db.velovs.insert_one(toInsert)

logging.info("Inserted ID in database : %s" % result.inserted_id)
