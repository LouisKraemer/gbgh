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

r = requests.get("https://public.opendatasoft.com/api/records/1.0/search/"
   "?dataset=" + "station-velov-grand-lyon" + 
   "&rows=" + "350")

logging.info("http request status code is : %s" % r.status_code)

toInsert = {"timestamp" : timestamp, "data" : r.json()['records']}
result = db.velovs.insert_one(toInsert)

logging.info("Inserted ID in database : %s" % result.inserted_id)
