#!/usr/bin/python3

from pymongo import MongoClient
import requests
import datetime
import time
import logging

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s %(name)-12s %(levelname)-8s %(message)s',
                    datefmt='%m-%d %H:%M',
                    filename='/tmp/fbGetEvents.log',
                    filemode='a')


accessToken = "403778083368774|g6rqxuSiYRoFagExlEyK6KFoI8U"

latLongArray = [[45.74267869027205,4.815984447486699],
   [45.76854936003471,4.844480236060917],
   [45.771662613416005,4.801908214576542],
   [45.73860536268864,4.855466564185917],
   [45.75968761082177,4.888082225807011],
   [45.78890210112422,4.877782543189824],
   [45.730937109051666,4.898381908424199],
   [45.71463858945306,4.822507579810917],
   [45.70960426216861,4.862676342017949]]

client = MongoClient("localhost:27017")
db=client.gbgh
db.events.create_index("id", unique=True)

now=datetime.datetime.now()
yesterday = now - datetime.timedelta(1)
tomorrow = now + datetime.timedelta(1)

def getEventsFromCoords(lat, long):
    logging.info("getting events for coordinates " + lat + ", " + long + ".")

    r = requests.get("http://localhost:3000/events" +
       "?accessToken=" + accessToken +
       "&lat=" + lat +
       "&lng=" + long +
       "&distance=" + "2000" +
       "&sort=" + "time" +
       "&since=" + yesterday.strftime("%s") +
       "&until=" + tomorrow.strftime("%s"))

    logging.info("http request status code is : %s" % r.status_code)

    for event in r.json()['events']:
         result = db.events.update_one({'id': event['id']}, { '$setOnInsert' : event}, upsert=True)
         logging.info("inserted id %s" % result.upserted_id)

#    result = db.events.insert_many(r.json()['events'])
#    logging.info("inserted ids are %s" % result.inserted_ids)

for array in latLongArray:
    getEventsFromCoords(str(array[0]), str(array[1]))
    time.sleep(180)
