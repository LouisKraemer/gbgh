# Extraction de données

## Données Facebook

Nous utilisons l'API Facebook afin de scrapper les événements de Lyon avec leur localisation, leur nom ainsi que leur heure de début et de fin.

Les données sont sous forme de JSON. Nous récupérons uniquement les données intéressantes de ce JSON afin de réduire le stockage nécessaire.

## Données Velo'v

Nous utilisons ici l'API fourni par la ville de Lyon sur le portail OpenData. Nous utilisons les données en temps réel mises à jour chaque minute. Nous ne récupérons encore une fois que les données nous intéressant (disponibilité, localisation).

## Récupération et stockage

Afin de disposer de plusieurs données sur une longue période, nous faisons tourner un script qui récupère les données Velo'v toutes les minutes et les données Facebook toutes les 12h.
