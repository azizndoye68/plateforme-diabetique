# Plateforme de Suivi des Patients Diabétiques — SuiviDiabète SN

Plateforme de santé numérique à architecture microservices, dédiée au suivi médical continu et sécurisé des patients diabétiques au Sénégal.

> Projet réalisé dans le cadre du Mémoire de Master II Génie Logiciel de **Abdoul Aziz NDOYE**, Université Assane Seck de Ziguinchor.

## Table des matières

- [Contexte](#contexte)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Services de la plateforme](#services-de-la-plateforme)
- [Bases de données](#bases-de-données)
- [Stack technique](#stack-technique)
- [Outils de développement](#outils-de-développement)
- [Structure d'un microservice](#structure-dun-microservice)
- [Approche Contract-First](#approche-contract-first)
- [Stratégie de tests](#stratégie-de-tests)
- [Méthodologie](#méthodologie)
- [Interfaces de l'application](#interfaces-de-lapplication)
- [Auteur](#auteur)

## Contexte

Le diabète représente un enjeu de santé publique majeur au Sénégal, marqué par des défis d'infrastructures, de ressources humaines et d'équipements, ainsi qu'une absence d'interopérabilité entre les systèmes de santé existants. Face aux limites constatées pour les patients, les professionnels de santé et les administrateurs, ce projet propose une plateforme de suivi des patients diabétiques inspirée de solutions comme MyDiabby, Glooko et mySugr, et alignée avec les standards internationaux HL7/FHIR.

## Fonctionnalités

- **Suivi médical quotidien** : enregistrement des mesures de glycémie, du poids, de la tension artérielle et des données du journal de bord (repas, activité physique, symptômes)
- **Détection d'anomalies** : logique de détection des valeurs anormales déclenchant des alertes médicales automatiques
- **Gestion des patients** : identité, coordonnées, localisation géographique, objectifs de santé, contenus éducatifs et conseils personnalisés
- **Gestion des professionnels de santé** : planification des rendez-vous, création et gestion d'équipes médicales pluridisciplinaires
- **Communication sécurisée** : échange de messages entre patients et professionnels de santé, historique des conversations, pièces jointes (résultats d'analyses, images)
- **Notifications** : alertes médicales, rappels de rendez-vous et confirmations d'actions envoyés de façon asynchrone
- **Trois espaces utilisateurs** : Patient, Professionnel de santé et Administrateur, chacun avec son propre tableau de bord

## Architecture

La plateforme repose sur une **architecture microservices**, choisie face aux limites du modèle monolithique (déploiements lourds, couplage fort, faible évolutivité). Elle est composée de **neuf microservices indépendants**, répartis en deux catégories :

- **Six services métiers** : Authentification-service, Patient-service, ProSante-service, Suivi-Medical-service, Communication-service, Notification-service
- **Trois services techniques** : Service-config, Service-register, API-Gateway

### Fonctionnement général

Au démarrage de la plateforme :
1. Le **Service-config** démarre en premier et met à disposition des autres services leurs fichiers de configuration, centralisés dans un dépôt Git.
2. Le **Service-register** démarre ensuite et se prépare à enregistrer les microservices.
3. Chaque service métier récupère sa configuration auprès du Service-config, puis s'enregistre auprès du Service-register avec ses informations réseau.
4. L'**API-Gateway** démarre en dernier et s'appuie sur ces informations pour acheminer les requêtes.

En fonctionnement, toute requête d'un patient ou d'un professionnel de santé transite par l'API Gateway, qui vérifie le jeton JWT, interroge le registre pour localiser le microservice concerné, puis transmet la demande. Lorsqu'un événement nécessite une notification (alerte glycémique, rappel de rendez-vous), le service métier concerné publie un message dans **RabbitMQ**, que le Notification-service consomme et achemine vers l'utilisateur destinataire.

## Services de la plateforme

### Services métiers

| Service | Rôle |
|---|---|
| **Authentification-service** *(Spring Security)* | Inscription et authentification des patients, professionnels de santé et administrateurs ; gestion des rôles et droits d'accès ; émission et validation de jetons JWT |
| **Suivi-Medical-service** *(Spring Boot)* | Cœur fonctionnel de la plateforme : mesures glycémiques, poids, tension artérielle, journal de bord (repas, activité physique, symptômes), traitements en cours, détection des valeurs anormales |
| **Patient-service** *(Spring Boot)* | Informations démographiques et administratives des patients : identité, coordonnées, localisation, date d'inscription, objectifs de santé, contenus éducatifs |
| **ProSante-service** *(Spring Boot)* | Informations et activités des professionnels de santé : planification des rendez-vous, création et gestion d'équipes médicales |
| **Communication-service** | Échanges sécurisés entre patients et professionnels de santé : messages, historique des conversations, pièces jointes |
| **Notification-service** *(Spring Boot)* | Envoi asynchrone des notifications via RabbitMQ : alertes médicales, rappels de rendez-vous, conseils personnalisés, confirmations d'actions |

### Services techniques

| Service | Rôle |
|---|---|
| **Service-config** *(Spring Cloud Config)* | Centralise la configuration de tous les microservices dans un dépôt Git ; propage dynamiquement les changements sans redémarrage |
| **Service-register** *(Spring Cloud Netflix Eureka)* | Annuaire dynamique des microservices ; chaque service s'y enregistre au démarrage (nom, IP, port) |
| **API-Gateway** *(Spring Cloud Gateway)* | Point d'entrée unique de la plateforme ; vérification des jetons JWT, routage vers le service cible, gestion des règles CORS, limitation du débit, journalisation centralisée |

## Bases de données

Conformément au principe **« une base de données par service »**, chaque microservice métier dispose de sa propre base **PostgreSQL**, indépendante des autres :

- `auth_service_db` — Authentification-service (utilisateurs, rôles, authentification)
- `patient_service_db` — Patient-service (informations personnelles et médicales)
- `prosante_service_db` — ProSante-service (données des professionnels de santé)
- `suivi_medical_db` — Suivi-Medical-service (mesures de glycémie, données de suivi)

Cette séparation réduit le couplage entre services et renforce la scalabilité, la maintenabilité et la résilience du système. La cohérence globale est assurée via les API REST et l'API Gateway.

## Stack technique

**Backend**
- **Java** — langage principal, portable et orienté objet
- **Spring Boot** — framework de développement d'applications prêtes pour la production
- **Spring Cloud** — gestion centralisée de la configuration et découverte de services
- **Spring Security** — authentification, autorisation et protection contre les attaques courantes (fixation de session, clickjacking, CSRF)
- **RabbitMQ** — broker de messages (protocole AMQP) pour la communication asynchrone entre services
- **Apache Tomcat** — serveur d'application embarqué

**Frontend**
- **React JS** — bibliothèque de construction d'interfaces, architecture orientée composants
- **Axios** — requêtes HTTP asynchrones basées sur les promesses
- **Bootstrap** — framework CSS responsive, approche mobile-first

**Base de données**
- **PostgreSQL** — SGBD relationnel-objet, une instance par microservice

## Outils de développement

- **SwaggerHub** — conception, documentation et partage des API selon la spécification OpenAPI
- **IntelliJ IDEA** — IDE principal pour le développement Java/Spring Boot
- **Visual Studio Code** — développement frontend
- **Git / GitHub** — gestion de versions et collaboration
- **Postman** — tests fonctionnels des API REST
- **PgAdmin** — administration des bases de données PostgreSQL
- **Jira** — gestion de projet et suivi des tâches (Scrum/Kanban)

## Structure d'un microservice

Chaque microservice suit une organisation en packages standardisée, inspirée des bonnes pratiques Spring Boot :

- `configuration` — configuration Swagger/OpenAPI, beans personnalisés, paramètres globaux
- `controller` — contrôleurs REST (`@RestController`, `@RequestMapping`), validation des entrées
- `dto` — objets de transfert de données (Data Transfer Objects)
- `entity` — entités métier persistées en base de données
- `application.properties` — nom du service, port, connexion PostgreSQL, adresse Eureka
- `pom.xml` — dépendances Maven, héritant de `spring-boot-starter-parent`

## Approche Contract-First

L'implémentation de la logique métier suit une démarche **Contract-First** plutôt que Code-First :

1. Définition du contrat OpenAPI sur **SwaggerHub** (endpoints, paramètres, formats de requêtes/réponses)
2. Validation du contrat au regard des besoins fonctionnels
3. Génération automatique de la documentation de l'API
4. Création du projet via Spring Initializr
5. Implémentation de la logique métier à travers les couches contrôleurs, services, repositories et entités

Cette démarche garantit la cohérence des interfaces entre services et limite les incohérences lors de l'intégration.

## Stratégie de tests

Une stratégie de tests multicouche a été mise en place :

- **Tests unitaires et d'intégration** — vérification de la robustesse des composants internes de chaque service
- **Tests de contrat inter-microservices (Pact)** — garantissent la compatibilité des échanges entre microservices consommateurs et fournisseurs
- **Tests fonctionnels (Postman)** — simulent le comportement d'un client externe pour valider le fonctionnement global du système (ex. inscription, authentification, mise à jour de mot de passe, suppression de compte)

## Méthodologie

Le projet combine les approches **Agile**, **DevOps** et **CI/CD**, adaptées aux besoins fonctionnels évolutifs de la santé numérique et aux exigences élevées de fiabilité du système.

## Interfaces de l'application

- **Interfaces d'accès** : page d'accueil, inscription, connexion
- **Interface Patient** : tableau de bord, enregistrement des données de suivi, historique (carnet de suivi)
- **Interface Professionnel de santé** : tableau de bord, communication avec les patients, visualisation des statistiques
- **Interface Administrateur** : tableau de bord, gestion des utilisateurs, validation des comptes professionnels

## Auteur

**Abdoul Aziz NDOYE**
Master II Génie Logiciel — Université Assane Seck de Ziguinchor, Sénégal
