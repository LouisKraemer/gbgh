#!/usr/bin/python3

from bson.json_util import loads

def clean_data(file_path):
    data = loads(open(file_path, 'rb').read())



clean_data('../../dump/gbgh/events.bson')