# Lancer la plateforme avec Docker Compose

## Préparer les variables

Le fichier `docker/.env` est ignoré par Git et contient les valeurs locales. Il existe déjà dans ce dépôt : conservez ses valeurs et ajoutez-y les variables manquantes indiquées dans `.env.example` :

- `RABBITMQ_DEFAULT_USER` et `RABBITMQ_DEFAULT_PASS`
- `JWT_SECRET` (la même valeur pour l'authentification et la communication)
- `AUTH_INTERNAL_API_KEY`
- `LOCAL_CONFIG_PATH` si le dossier de configuration Spring n'est pas à son emplacement Windows par défaut
- `REACT_APP_API_BASE_URL` si l'URL publique du frontend est différente

Utilisez des valeurs aléatoires longues pour les secrets. Le fichier `.env.example` ne contient que des exemples.

## Dossier de configuration Spring

Compose monte `C:\Users\DELL\config-data-local` en lecture seule sous `/config` dans `service-config` et lui demande de lire les configurations depuis `file:/config/`. Si le dossier se trouve ailleurs, définissez `LOCAL_CONFIG_PATH` dans `docker/.env` avec son chemin Windows, par exemple `D:/mes-configs/spring`.

Les propriétés présentes dans le Config Server peuvent conserver leurs secrets. Dans le réseau Docker, les paramètres de connexion aux bases et à RabbitMQ ainsi que l'adresse Eureka sont remplacés par les variables du Compose. Vérifiez que les fichiers du Config Server portent des noms compatibles avec les noms Spring des applications (`auth-service`, `communication-service`, etc.).

## Démarrer

Depuis la racine du dépôt, dans PowerShell :

```powershell
docker compose --env-file docker/.env -f docker/compose.yaml up --build -d
```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000). L'interface appelle le gateway par le proxy Nginx du conteneur frontend. Eureka est accessible pour le diagnostic sur [http://localhost:8761](http://localhost:8761) et la console RabbitMQ sur [http://localhost:15672](http://localhost:15672).

Pour suivre le démarrage :

```powershell
docker compose --env-file docker/.env -f docker/compose.yaml ps
docker compose --env-file docker/.env -f docker/compose.yaml logs -f service-config service-register api-gateway
```

Arrêter sans supprimer les données :

```powershell
docker compose --env-file docker/.env -f docker/compose.yaml down
```

Les données PostgreSQL et RabbitMQ sont conservées dans des volumes Docker. N'utilisez `down -v` que si vous voulez explicitement effacer ces données.

## Accès depuis un téléphone sur le réseau local

Pour tester le PWA sur le même Wi-Fi, définissez `REACT_APP_API_BASE_URL` dans `docker/.env` avec l'adresse IP locale de l'ordinateur, par exemple `http://192.168.1.20:3000`, puis reconstruisez le frontend. Autorisez aussi cette origine dans la configuration CORS/Chat fournie au Config Server et ouvrez le port 3000 dans le pare-feu Windows.

Cette configuration sert au développement local. Une mise en production doit utiliser un nom de domaine, HTTPS, un certificat TLS et des secrets propres à l'environnement. Une PWA installable sur Android exige HTTPS en dehors de `localhost`.
