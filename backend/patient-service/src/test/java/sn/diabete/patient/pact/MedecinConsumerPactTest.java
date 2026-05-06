package sn.diabete.patient.pact;

import au.com.dius.pact.consumer.MockServer;
import au.com.dius.pact.consumer.dsl.PactBuilder;
import au.com.dius.pact.consumer.junit5.PactConsumerTestExt;
import au.com.dius.pact.consumer.junit5.PactTestFor;
import au.com.dius.pact.core.model.V4Pact;
import au.com.dius.pact.core.model.annotations.Pact;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(PactConsumerTestExt.class)
@PactTestFor(providerName = "MedecinService")
@ActiveProfiles("test")
@DisplayName("Pact Consumer — Patient-service → MedecinService")
class MedecinConsumerPactTest {

    // ══════════════════════════════════════════════════════════════
    // CONTRAT 1 — GET /api/medecins/numero/{numeroProfessionnel}
    // médecin existant → 200
    // ══════════════════════════════════════════════════════════════

    @Pact(provider = "MedecinService", consumer = "PatientService")
    public V4Pact getMedecinParNumeroProfessionnel(PactBuilder builder) {
        return builder
                .usingLegacyDsl()
                .given("un médecin avec le numéro MED25ABC existe")
                .uponReceiving("GET /api/medecins/numero/MED25ABC")
                .path("/api/medecins/numero/MED25ABC")
                .method("GET")
                .willRespondWith()
                .status(200)
                .headers(Map.of("Content-Type", "application/json"))
                .body("""
                    {
                        "id": 1,
                        "numeroProfessionnel": "MED25ABC",
                        "prenom": "Moussa",
                        "nom": "Diallo",
                        "specialite": "Endocrinologie",
                        "telephone": "771234567"
                    }
                    """)
                .toPact(V4Pact.class);
    }

    @Test
    @PactTestFor(pactMethod = "getMedecinParNumeroProfessionnel")
    @DisplayName("GET /numero/MED25ABC — médecin existant → 200 avec id")
    void getMedecinParNumeroProfessionnel_retourne200(MockServer mockServer) {
        RestTemplate restTemplate = new RestTemplate();
        String url = mockServer.getUrl() + "/api/medecins/numero/MED25ABC";

        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("id")).isNotNull();
        assertThat(response.getBody().get("numeroProfessionnel"))
                .isEqualTo("MED25ABC");
    }

    // ══════════════════════════════════════════════════════════════
    // CONTRAT 2 — GET /api/medecins/numero/{num} — médecin absent
    // ══════════════════════════════════════════════════════════════

    @Pact(provider = "MedecinService", consumer = "PatientService")
    public V4Pact getMedecinParNumeroInexistant(PactBuilder builder) {
        return builder
                .usingLegacyDsl()
                .given("aucun médecin avec le numéro MED00XXX")
                .uponReceiving("GET /api/medecins/numero/MED00XXX — médecin absent")
                .path("/api/medecins/numero/MED00XXX")
                .method("GET")
                .willRespondWith()
                .status(404)
                .toPact(V4Pact.class);
    }

    @Test
    @PactTestFor(pactMethod = "getMedecinParNumeroInexistant")
    @DisplayName("GET /numero/MED00XXX — médecin absent → 404")
    void getMedecinParNumeroInexistant_retourne404(MockServer mockServer) {
        RestTemplate restTemplate = new RestTemplate();
        String url = mockServer.getUrl() + "/api/medecins/numero/MED00XXX";

        assertThatThrownBy(() -> restTemplate.getForEntity(url, Map.class))
                .isInstanceOf(HttpClientErrorException.class)
                .extracting(ex -> ((HttpClientErrorException) ex).getStatusCode().value())
                .isEqualTo(404);
    }

    // ══════════════════════════════════════════════════════════════
    // CONTRAT 3 — GET /api/medecins/{id} — médecin existant
    // ══════════════════════════════════════════════════════════════

    @Pact(provider = "MedecinService", consumer = "PatientService")
    public V4Pact getMedecinParId(PactBuilder builder) {
        return builder
                .usingLegacyDsl()
                .given("un médecin avec l'ID 1 existe")
                .uponReceiving("GET /api/medecins/1")
                .path("/api/medecins/1")
                .method("GET")
                .willRespondWith()
                .status(200)
                .headers(Map.of("Content-Type", "application/json"))
                .body("""
                    {
                        "id": 1,
                        "numeroProfessionnel": "MED25ABC",
                        "prenom": "Moussa",
                        "nom": "Diallo",
                        "specialite": "Endocrinologie",
                        "telephone": "771234567"
                    }
                    """)
                .toPact(V4Pact.class);
    }

    @Test
    @PactTestFor(pactMethod = "getMedecinParId")
    @DisplayName("GET /api/medecins/1 — médecin existant → 200 avec id")
    void getMedecinParId_retourne200(MockServer mockServer) {
        RestTemplate restTemplate = new RestTemplate();
        String url = mockServer.getUrl() + "/api/medecins/1";

        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("id")).isNotNull();
    }

    // ══════════════════════════════════════════════════════════════
    // CONTRAT 4 — GET /api/medecins/{id} — médecin absent
    // ══════════════════════════════════════════════════════════════

    @Pact(provider = "MedecinService", consumer = "PatientService")
    public V4Pact getMedecinParIdInexistant(PactBuilder builder) {
        return builder
                .usingLegacyDsl()
                .given("aucun médecin avec l'ID 999")
                .uponReceiving("GET /api/medecins/999 — médecin absent")
                .path("/api/medecins/999")
                .method("GET")
                .willRespondWith()
                .status(404)
                .toPact(V4Pact.class);
    }

    @Test
    @PactTestFor(pactMethod = "getMedecinParIdInexistant")
    @DisplayName("GET /api/medecins/999 — médecin absent → 404")
    void getMedecinParIdInexistant_retourne404(MockServer mockServer) {
        RestTemplate restTemplate = new RestTemplate();
        String url = mockServer.getUrl() + "/api/medecins/999";

        assertThatThrownBy(() -> restTemplate.getForEntity(url, Map.class))
                .isInstanceOf(HttpClientErrorException.class)
                .extracting(ex -> ((HttpClientErrorException) ex).getStatusCode().value())
                .isEqualTo(404);
    }

    // ══════════════════════════════════════════════════════════════
    // CONTRAT 5 — GET /api/equipes-medicales/medecin/{id}
    // équipes trouvées → 200
    // ══════════════════════════════════════════════════════════════

    @Pact(provider = "MedecinService", consumer = "PatientService")
    public V4Pact getEquipesDuMedecin(PactBuilder builder) {
        return builder
                .usingLegacyDsl()
                .given("le médecin ID 1 a des équipes médicales")
                .uponReceiving("GET /api/equipes-medicales/medecin/1")
                .path("/api/equipes-medicales/medecin/1")
                .method("GET")
                .willRespondWith()
                .status(200)
                .headers(Map.of("Content-Type", "application/json"))
                .body("""
                [
                    {
                        "id": 1,
                        "nom": "Equipe Diabetologie",
                        "medecinProprietaireId": 1,
                        "medecinsIds": [1, 2]
                    }
                ]
                """)
                .toPact(V4Pact.class);
    }

    @Test
    @PactTestFor(pactMethod = "getEquipesDuMedecin")
    @DisplayName("GET /equipes-medicales/medecin/1 — équipes trouvées → 200")
    void getEquipesDuMedecin_retourne200(MockServer mockServer) {
        RestTemplate restTemplate = new RestTemplate();
        String url = mockServer.getUrl() + "/api/equipes-medicales/medecin/1";

        ResponseEntity<Object[]> response =
                restTemplate.getForEntity(url, Object[].class);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().length).isGreaterThanOrEqualTo(1);

        // medecinProprietaireId doit être présent
        // (utilisé par getPatientsVisiblesPourMedecin)
        Map<?, ?> premiereEquipe = (Map<?, ?>) response.getBody()[0];
        assertThat(premiereEquipe.get("medecinProprietaireId")).isNotNull();
    }

    // ══════════════════════════════════════════════════════════════
    // CONTRAT 6 — GET /api/equipes-medicales/medecin/{id}
    // aucune équipe → 200 liste vide
    // ══════════════════════════════════════════════════════════════

    @Pact(provider = "MedecinService", consumer = "PatientService")
    public V4Pact getEquipesDuMedecinVide(PactBuilder builder) {
        return builder
                .usingLegacyDsl()
                .given("le médecin ID 2 n'a aucune équipe")
                .uponReceiving("GET /api/equipes-medicales/medecin/2 — aucune équipe")
                .path("/api/equipes-medicales/medecin/2")
                .method("GET")
                .willRespondWith()
                .status(200)
                .headers(Map.of("Content-Type", "application/json"))
                .body("[]")
                .toPact(V4Pact.class);
    }

    @Test
    @PactTestFor(pactMethod = "getEquipesDuMedecinVide")
    @DisplayName("GET /equipes-medicales/medecin/2 — aucune équipe → 200 liste vide")
    void getEquipesDuMedecinVide_retourneListeVide(MockServer mockServer) {
        RestTemplate restTemplate = new RestTemplate();
        String url = mockServer.getUrl() + "/api/equipes-medicales/medecin/2";

        ResponseEntity<Object[]> response =
                restTemplate.getForEntity(url, Object[].class);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(
                response.getBody() == null || response.getBody().length == 0
        ).isTrue();
    }
}