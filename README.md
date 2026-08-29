# SuiviDiabète SN

Plateforme de suivi médical numérique basée sur une architecture microservices, dédiée au suivi des patients diabétiques au Sénégal.

## À propos du projet

SuiviDiabète SN est une application de santé numérique conçue pour faciliter le suivi glycémique, la gestion des dossiers médicaux et la coordination entre patients et professionnels de santé. Le projet a été développé dans le cadre d'un mémoire de Master en Génie Logiciel, selon une méthodologie Scrum, et constitue le socle du portfolio technique de son auteur.

## Fonctionnalités

- **Suivi glycémique** — enregistrement et visualisation des mesures de glycémie
- **Dossier médical** — historique médical du patient
- **Prise de rendez-vous** — planification des consultations avec les professionnels de santé
- **Notifications** — alertes et rappels automatisés
- **Tableau de bord** — vue d'ensemble des données de santé du patient
- **Authentification par rôles** — gestion des accès (patient / professionnel de santé) via JWT

## Architecture

Le système est composé de neuf services indépendants, orchestrés selon une architecture microservices avec Spring Cloud (Eureka pour la découverte de services, API Gateway pour le routage, Config Server pour la configuration centralisée).

```
┌─────────────┐
│   Frontend  │  React
└──────┬──────┘
       │
┌──────▼──────┐
│ API Gateway │  Spring Cloud Gateway
└──────┬──────┘
       │
┌──────▼──────────────────────────────┐
│         Service Discovery           │  Eureka
├───────────────────────────────────────┤
│  Config Server │ ProSante-service │ ... (9 services au total)
└───────────────────────────────────────┘
       │
┌──────▼──────┐   ┌─────────────┐
│ PostgreSQL  │   │  RabbitMQ   │
└─────────────┘   └─────────────┘
```

> *Note : à compléter avec la liste exacte des neuf services et leur rôle respectif (ex. service utilisateur, service ProSante, service rendez-vous, service notification, etc.), ainsi que le schéma réel de communication entre eux.*

## Stack technique

| Domaine | Technologies |
|---|---|
| Backend | Spring Boot |
| Frontend | React |
| Base de données | PostgreSQL |
| Messagerie asynchrone | RabbitMQ |
| Conteneurisation | Docker, Docker Compose |
| Sécurité | JWT |
| Architecture cloud | Spring Cloud (Eureka, API Gateway, Config Server) |
| Documentation API | OpenAPI / SwaggerHub (approche Contract-First) |
| Tests de contrat | Pact |
| Intégration continue | CI/CD (GitHub Actions) |

## Méthodologie

Le projet a été développé selon la méthodologie **Scrum**, avec des sprints itératifs et une répartition claire des rôles au sein de l'équipe (Scrum Master, Product Owner, équipe de développement).

## Prérequis

- Docker et Docker Compose
- JDK 17+ (ou version utilisée par les services Spring Boot)
- Node.js et npm/yarn (pour le frontend React)
- PostgreSQL (ou via conteneur Docker)
- RabbitMQ (ou via conteneur Docker)

## Installation et démarrage

```bash
# Cloner le dépôt
git clone <url-du-depot>
cd suivi-diabete-sn

# Lancer l'ensemble des services via Docker Compose
docker-compose up --build
```

> *Note : à adapter selon la structure réelle du dépôt (mono-repo ou multi-repo), les variables d'environnement nécessaires (`.env`), et les ports exposés par chaque service.*

## Documentation API

Les contrats d'API sont définis selon une approche **Contract-First** avec OpenAPI, publiés et versionnés sur SwaggerHub, et validés par des tests de contrat **Pact** entre services consommateurs et fournisseurs.

## Intégration continue / Déploiement continu

Le projet intègre un pipeline CI/CD (GitHub Actions) pour l'automatisation des builds, des tests et du déploiement.

## Auteur

Développé par **Aziz**, dans le cadre de son mémoire de Master en Génie Logiciel — Université Assane Seck de Ziguinchor, Sénégal.

- Directeur de mémoire : Pr Youssou Dieng
- Scrum Master : Pr Ibrahima Diop

## Licence

*À définir.*
