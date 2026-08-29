# SuiviDiabète SN

Plateforme de suivi médical pour patients diabétiques, conçue en architecture microservices. Neuf services indépendants, chacun avec sa propre base de données, orchestrés via Spring Cloud (registre de services, configuration centralisée, passerelle API) et communiquant en asynchrone via RabbitMQ pour les flux événementiels (alertes, notifications).

## Pourquoi une architecture microservices

Le choix a été fait en écartant volontairement le monolithe : dans un contexte de santé numérique, les modules (authentification, données médicales, gestion des professionnels, communication) ont des cycles d'évolution et des exigences de sécurité différents. Isoler chaque domaine permet de faire évoluer, tester et déployer un service sans impacter les autres, et de découpler la disponibilité globale de la plateforme d'une panne locale.

Le compromis assumé : complexité opérationnelle plus élevée (découverte de services, cohérence des données distribuées, observabilité) en échange de la scalabilité indépendante et de l'isolation des pannes.

## Architecture

```
                        ┌────────────────┐
                        │  Frontend React │
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │   API Gateway    │  auth JWT, routage, CORS, rate limiting
                        └────────┬────────┘
                                 │  (consulte le registre pour résoudre chaque service)
              ┌──────────────────┼──────────────────┐
              │                  │                   │
     ┌────────▼───────┐ ┌────────▼────────┐ ┌────────▼─────────┐
     │ Service-register│ │  Service-config  │ │  Auth-service     │
     │    (Eureka)      │ │ (config Git)     │ │  (Spring Security) │
     └──────────────────┘ └──────────────────┘ └────────────────────┘
              │
   ┌──────────┼─────────────┬──────────────────┬───────────────────┐
   │          │              │                  │                   │
┌──▼───┐ ┌────▼─────┐ ┌──────▼───────┐ ┌────────▼────────┐ ┌────────▼────────┐
│Patient│ │ProSante  │ │Suivi-Medical │ │Communication     │ │Notification      │
│service│ │-service  │ │-service      │ │-service           │ │-service (RabbitMQ)│
└───┬───┘ └────┬─────┘ └──────┬───────┘ └────────┬─────────┘ └────────┬─────────┘
    │          │              │                  │                    │
    └──────────┴──────────────┴──────────────────┴────────────────────┘
                                 │
                      PostgreSQL (1 base par service)
```

**Séquence de démarrage** : Service-config démarre en premier et sert la configuration de tous les services depuis un dépôt Git. Service-register (Eureka) prend le relais pour l'enregistrement dynamique. Chaque service métier récupère sa config, s'enregistre auprès du registre avec ses infos réseau. L'API Gateway démarre en dernier, une fois le registre peuplé.

**Flux d'une requête** : client → API Gateway (validation JWT) → résolution du service cible via Eureka → routage. Les événements asynchrones (alerte glycémique, rappel de rendez-vous) passent par une publication RabbitMQ, consommée par le Notification-service — découplage total entre l'émetteur de l'événement et sa livraison.

## Services

| Service | Responsabilité |
|---|---|
| `api-gateway` | Point d'entrée unique : validation JWT, routage, CORS, rate limiting, logs centralisés |
| `service-register` | Registre de services (Eureka) — découverte dynamique, aucune adresse en dur |
| `service-config` | Configuration centralisée versionnée dans Git, propagée sans redémarrage |
| `auth-service` | Authentification, gestion des rôles (patient / professionnel / admin), émission et validation des JWT |
| `patient-service` | Profils patients : identité, coordonnées, objectifs de santé |
| `prosante-service` | Profils professionnels de santé, planification, gestion d'équipes |
| `suivi-medical-service` | Cœur métier : mesures glycémiques, poids, tension, journal de bord, détection de valeurs anormales |
| `communication-service` | Messagerie sécurisée patient ↔ professionnel, historique, pièces jointes |
| `notification-service` | Consommateur RabbitMQ, dispatch des notifications aux utilisateurs concernés |

Chaque service métier expose son contrat via une API REST spécifiée en amont avec OpenAPI (voir plus bas).

## Stack technique

- **Backend** : Java 17, Spring Boot, Spring Cloud (Eureka, Gateway, Config), Spring Security (JWT)
- **Messagerie** : RabbitMQ (AMQP) pour les flux asynchrones inter-services
- **Frontend** : React, Axios, Bootstrap
- **Données** : PostgreSQL — une base isolée par service, aucun accès croisé direct
- **Conteneurisation** : Docker, Docker Compose

## Design d'API — Contract-First

Les contrats sont définis et validés sur SwaggerHub *avant* l'implémentation, pas générés a posteriori depuis le code. Ce choix impose une discipline sur les interfaces dès la conception et limite les incohérences entre équipes/services consommateurs et fournisseurs — vérifié en continu par des tests de contrat **Pact**, qui font échouer le build si un service casse un contrat consommé par un autre.

## Tests

Stratégie multicouche, chaque niveau couvrant une classe de régression différente :

- **Unitaires / intégration** — logique métier et couche de persistance de chaque service, isolément
- **Contrat (Pact)** — compatibilité des échanges entre services consommateurs et fournisseurs, indépendamment de leur déploiement simultané
- **Fonctionnels (Postman)** — scénarios de bout en bout simulant un client réel (inscription, authentification, mise à jour, suppression de compte avec règles de sécurité)

## Lancer le projet

```bash
git clone <url-du-depot>
cd suivi-diabete-sn
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | `http://localhost:3000` |
| API Gateway | `http://localhost:8080` |
| Eureka (registre) | `http://localhost:8761` |

Ordre de démarrage géré par Docker Compose : infrastructure (PostgreSQL, RabbitMQ) → Config Server → Eureka → services métiers → API Gateway.

## Limites connues et pistes d'évolution

- Cohérence des données inter-services actuellement gérée au niveau applicatif — une saga ou un pattern d'événements transactionnels (outbox) renforcerait la fiabilité sur les flux critiques
- Pas encore d'observabilité centralisée (tracing distribué, dashboards de métriques) au-delà des logs de l'API Gateway
- Alignement HL7/FHIR envisagé pour l'interopérabilité avec d'autres systèmes de santé, non encore implémenté

## Auteur

**Abdoul Aziz Ndoye** — Développeur Fullstack
