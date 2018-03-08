# GoBikeOrGoHome

The website is currently available on the link below :

[GoBikeOrGoHome](http://creti.fr/gbgh)

## Motivations

Nowadays, several cities have self-service bike rental systems in order for the citizens to be able to move freely around the city. The problem behind this system is that sometimes, bike stations may be empty (and you can't fetch a bike) or full (and you can't return your bike). We thought that the number of available bikes in a station could be related to events that happen at the same place. In order to find out if our instinct is correct, we decided to create an application which allows us to visualize, for any given time, the Facebook events that happened and the number of bikes in all bike stations in the city of Lyon.
With thi tool, we can see if stations get full when an event starts and people **go bike** or if stations get empty when an event ends and people **go home**




## Goals

As said before, our aim with this project is to visualize the correlation between the flow of people from events (scrapped from Facebook) and the variation of the number of bikes in Velo'v (Lyon's bike rental system) stations. In order to do so, we have put all of this information in a map of the city, while ensuring that all the needed information (stations, number of bikes per station, events, time until event's end or beginning) is correctly represented in the map.

## Strategy


### Behind the scenes

This paragraph describes everything that happens but cannot be seen by the frontend user

#### The data
The data comes from two sources : 
+ The Events data comes from the facebook API
Even though Facebook's API doesn't allow the user to search events by geographical location, there is a workaround : we can search venues by location and then list the upcomming events associated with each given venue. In order to use this strategy, we are using the code provided in [https://github.com/tobilg/facebook-events-by-location](this repository). It starts a web server that answers http GET requests with the events found in a given radius around a given point. Events are given in a JSON format and contain information such as start time, end time, number of attendees, geographical position, etc.

+ The bike data comes from the Lyon's opendata API
This API has, among others, two endpoints : [https://data.grandlyon.com/equipements/station-vflov/](one) which serves the static data about the Velo'v stations (name, address, position, total number of bike stands, etc.) and [https://data.grandlyon.com/equipements/station-vflov-disponibilitfs-temps-rfel/](another) one which serves, every minute, the number of bikes and free bike stands in every station. Both of these endpoints serve JSONs containing the static or dynamic information.

#### The backend

Even though the data is served as JSON files, we found two reasons why our application needed a more complex backend. The first one is that in order to restrain the number of requests made to facebook and to Lyon's opendata, we need to stock the data ourselves. The second reason is that the raw data is too big, and it needs to be filtered and cleaned by a script in order to be chargeable in a reasonable time in the frontend.
Since all of the data is in the JSON format, we decided to stock it in a mongoDB database. In order to stock it, one machine (called here ScrapperMachine) hosts the facebook-events-by-location server and two python scripts ([/backend/getEvent.py](1) and [/backend/getVelov.py](2)) that scrap the APIs and injects the data in a MongoDB database hosted by [http://mlab.com](Mlab). This task is independent from the rest and runs in the background in ScrapperMachine.
Once the MongoDB database has data, a second machine (called PHPHost) fetches the data from the Mlab database and serves it, with the frontend javascript application, via PHP to the frontend user.

Here is a schema synthetizing all of these interactions : 
![alt text](/docs/assets/schema.png "Backend Schema")

### In the front

First, we request two sets of data. The first gives us all the informations about the velov stations and their location so we can place them on the map. The second one concern the facebook events taking place during the the present moment.
After the initial load, the user can do one of two things : 
- We can click on a district to zoom in and see precisely which stations and which event are nearby. For that, we use d3 zoom ability.
- We can select a different date. For a selected date, the front will request stations data for the next 30 minutes and store them allowing a more fluid navigation.  

#### Facebook logo

Each logo can be of three different color :
- Green : the event will happen in the next two hours or less
- Orange : the event is happening
- Red : the event ended less than two hours ago
The size get its greatest size when the event is near the begining or the end.

#### Stations

Each stations is represented by a circle. When hovering a circle we get three informations :
- The name of the station
- The number of available bikes
- The number of available bike stands
The size represents the ratio of available bikes over the maximum capacity giving us a simple visualization.

## How to

In order to install and serve the website, the user needs to install all npm packages by running inside the root of the repository
'''
npm install
'''
Once the command is done, the user needs to start the facebook events server API by using the command
'''
/backend/start.sh
'''
After running the server, getEvent.py and getVelov.py allows us to inject the wanted data in a mongoDB database which the users need to adapt (his own database in mlab).

Once the script are running at the desired frequency (crontab can easily do that) and loading the desired database, the user can serve the site with Apache while making sure that the file in the directory '/endpoints' points to the right mlab database.

## Authors

Creti Gabriel & Kraemer Louis
