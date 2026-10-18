#!/bin/sh
set -eu

for database in auth_service_db patient_service_db medecin_service_db suivi_medical_db notification_db communication_db; do
  psql --username "$POSTGRES_USER" --dbname postgres --set ON_ERROR_STOP=1 \
    --command "CREATE DATABASE \"$database\" OWNER \"$POSTGRES_USER\";"
done
