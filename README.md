# Istruzioni

Di seguito sono elencate le operazioni per installare il software.


# Compiler_service

## - Docker Image Build 
```
docker build -t compiler_service .
```
## - Docker Push
```
docker tag compiler_service loriszn/server-setup:compiler_service
```
```
docker push loriszn/server-setup:compiler_service
```


# Exercise_service

## - Maven Build
```
mvn clean install
```
## - Docker Image Build
```
docker build -t exercise_service .
```
## - Docker Push
```
docker tag exercise_service loriszn/server-setup:exercise_service
```
```
docker push loriszn/server-setup:exercise_service
```


# Frontend 

## - Docker Image Build 
```
docker build -t frontend .
```
## - Docker Push
```
docker tag frontend loriszn/server-setup:frontend
```
```
docker push loriszn/server-setup:frontend
```


# Leaderboard_service

## - Maven Build
```
mvn clean install
```
## - Docker Image Build
```
docker build -t leaderboard_service .
```
## - Docker Push
```
docker tag leaderboard_service loriszn/server-setup:leaderboard_service
```
```
docker push loriszn/server-setup:leaderboard_service
```


# User_service

## - Maven Build
```
mvn clean install
```
## - Docker Image Build 
```
docker build -t user_service .
```
## - Docker Push
```
docker tag user_service loriszn/server-setup:user_service
```
```
docker push loriszn/server-setup:user_service
```


# Server-Setup

## - Docker Volume Create
```
docker volume create assignments
```
## - Docker Image Build 
```
docker build -f Dockerfile.assignments -t assignments-image .
```
## - Docker Volume Populate

La popolazione del volume per gli assignment, dunque, avviene copiando i file json nell'immagine "assignments-image" (con il comando "COPY nome_file.json /assignments/" nel file "Dockerfile.assignments") ed eseguendo il comando "docker run" citato sopra, dando come parametri i nomi dei file json appena inseriti. Inoltre, bisogna aggiungere manualmente il nome del file json nel metodo "getAssignments()" della classe "AssignmentsService" all'interno del frontend.

```
docker run --rm -v assignments:/mnt assignments-image sh -c "cp /assignments/esperimento1.json /mnt/ && cp /assignments/esperimento2.json /mnt/" 
```

## - Docker Compose
```
docker-compose up -d
```


Con il comando compose avverrà la creazione di tutti i container necessari alla creazione dell’infrastruttura che permette di ospitare una sessione di gioco.

In seguito all’avvio di tutti i container è possibile accedere all’applicativo, partendo dal calcolatore server, al seguente indirizzo:

http://localhost:4200/

In questo scenario avremo quindi installato correttamente il server in locale. 
