# Déploiement sur Render

Le workflow GitHub Actions construit et publie dix images sur GHCR. Le job Render est volontairement désactivé par défaut : il ne se lance qu'après les tests et la publication des images, lorsque la variable GitHub `RENDER_DEPLOY_ENABLED` vaut `true`.

## 1. Préparer Render

1. Publier une première fois la branche `local_dev` ou `main` pour créer les images GHCR.
2. Dans Render, ajouter une credential de registre pour `ghcr.io`. Pour un package privé, utiliser un token GitHub ayant `read:packages`.
3. Créer dix services Render à partir des images `ghcr.io/azizndoye68/plateforme-diabetique/<nom>:local_dev` :

   - Services Web publics : `frontend`.
   - Service privé : `api-gateway` (le frontend lui transmet les requêtes via le réseau privé Render).
   - Services privés : `service-config`, `service-register`, `auth-service`, `patient-service`, `medecin-service`, `suivi-medical-service`, `notification-service`, `communication-service`.

Utiliser la même région pour tous les services. Les images backend écoutent sur les ports définis dans leurs configurations Spring (`8888`, `8761`, `8081`, `8082`, `8084`, `8085`, `8090` et `8086`). Le port Render du gateway doit être configuré pour correspondre à `8080`.

## 2. Configurer les dépendances et les secrets

Render ne peut pas monter le dossier Windows `C:\Users\DELL\config-data-local`. Dans le service `service-config`, téléverser les fichiers de configuration comme **Secret Files** Render, puis régler :

```text
SPRING_PROFILES_ACTIVE=native
SPRING_CLOUD_CONFIG_SERVER_NATIVE_SEARCH_LOCATIONS=file:/etc/secrets/
```

Les fichiers doivent contenir les paramètres de production, notamment les URLs PostgreSQL, RabbitMQ, Eureka, les services Feign, les origines CORS, ainsi que les secrets. Remplacer les adresses `localhost` par les noms d'hôte privés Render correspondants. Ne pas copier les mots de passe du poste local dans GitHub.

Créer les bases PostgreSQL attendues par les services (`auth_service_db`, `patient_service_db`, `medecin_service_db`, `suivi_medical_db`, `notification_db` et `communication_db`) ou adapter chaque URL de datasource à l'infrastructure choisie. Render ne reprend pas les volumes PostgreSQL/RabbitMQ du Compose local.

Configurer une instance RabbitMQ accessible depuis le réseau privé Render (ou un fournisseur externe) et renseigner ses identifiants dans les configurations des services qui l'utilisent.

Pour le frontend, définir `API_GATEWAY_URL` dans Render avec l'adresse HTTP privée du gateway, par exemple `http://<hôte-interne-gateway>:<port>`.

## 3. Activer le déploiement continu

Dans **Settings > Deploy Hook** de chaque service Render, copier l'URL du hook. Dans GitHub, ouvrir **Settings > Secrets and variables > Actions** et créer les secrets suivants :

```text
RENDER_HOOK_API_GATEWAY
RENDER_HOOK_AUTH_SERVICE
RENDER_HOOK_COMMUNICATION_SERVICE
RENDER_HOOK_FRONTEND
RENDER_HOOK_MEDECIN_SERVICE
RENDER_HOOK_NOTIFICATION_SERVICE
RENDER_HOOK_PATIENT_SERVICE
RENDER_HOOK_SERVICE_CONFIG
RENDER_HOOK_SERVICE_REGISTER
RENDER_HOOK_SUIVI_MEDICAL_SERVICE
```

Créer ensuite la variable de dépôt `RENDER_DEPLOY_ENABLED` avec la valeur `true`. Après un push sur `main` ou `local_dev`, GitHub lance les tests, publie les images taguées avec le SHA complet du commit, puis demande à Render de déployer exactement ces tags.

Les hooks Render sont des secrets : ne pas les mettre dans `render.yaml`, dans le dépôt, ni dans les logs. Si un service échoue au premier démarrage, vérifier d'abord l'ordre et les valeurs de configuration centralisée, puis consulter ses logs Render.
