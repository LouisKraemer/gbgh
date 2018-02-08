# GBGH - Go Bike or Go Home - Data

## Définition des data utilisés

Dans ce projet, nous utiliserons deux sources de données. La première est la donnée fournie par l'agglomération de Lyon sur les disponibilités de Velo'v et la deuxième est l'ensemble de données publiques sur facebook concernant des événements.
Dans un premier temps, nous envisageons d'utiliser des données de ces deux sources scrappées sur une semaine, puis dans un deuxième temps, nous envisageons d'exposer un backend qui expose ces données en temps réel.

## Données Velo'v

Ces données sont scrappées via une API HTTP exposée par le site opendatasoft. Le détail de cette api se trouve dans le lien suivant : [lien](https://public.opendatasoft.com/explore/dataset/station-velov-grand-lyon/api/?flg=fr)
Du fait que ces données sont de l'opendata, nous pouvons les utiliser librement.

Comme, pour l'instant, nous scrappons cette API sur une semaine avec une frequence d'un update par minute, nous allons générer au bout de la semaine 2688 Mb de données non nettoyées, qui seront par la suite preprocessées.
Ce processus de scraping se terminera le jeudi 15/02.

Le scrapping de ce dataset est fait avec un [script python](./getVelov.py) qui est executé via crontab. Ce script injecte les JSONs fournis par l'api web dans une base mongoDb. 

## Données event Facebook

Ces données sont scrappées de la partie publique de facebook. Pour ce faire, nous avons utilisé le répositoire suivant : [facebook-events-by-location](https://github.com/tobilg/facebook-events-by-location).
Ce repositoire en node.js nous permet de créer une API HTTP en localhost qui permet d'interroger facebook sur des événements publiques autour d'une zone définie en paramètre dans la requête.

Comme l'API précedente, celle-ci renvoie un JSON. le traitement est donc le même : 
nous scrappons deux fois par jour tous les événements dans la ville de Lyon avec un [script python](./getEvent.py) qui est executé par un crontab également. Ensuite, les données sont injectées dans une base de données MongoDb.

