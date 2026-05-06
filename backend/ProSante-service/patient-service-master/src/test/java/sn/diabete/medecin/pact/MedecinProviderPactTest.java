package sn.diabete.medecin.pact;

import au.com.dius.pact.provider.junit5.PactVerificationContext;
import au.com.dius.pact.provider.junit5.PactVerificationInvocationContextProvider;
import au.com.dius.pact.provider.junitsupport.Provider;
import au.com.dius.pact.provider.junitsupport.State;
import au.com.dius.pact.provider.junitsupport.loader.PactFolder;
import au.com.dius.pact.provider.spring.junit5.MockMvcTestTarget;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.TestTemplate;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import sn.diabete.medecin.controller.EquipeMedicaleController;
import sn.diabete.medecin.controller.MedecinController;
import sn.diabete.medecin.dto.EquipeMedicaleResponse;
import sn.diabete.medecin.dto.MedecinResponse;
import sn.diabete.medecin.entity.Sexe;
import sn.diabete.medecin.exception.ResourceNotFoundException;
import sn.diabete.medecin.service.EquipeMedicaleService;
import sn.diabete.medecin.service.MedecinService;

import java.time.LocalDate;
import java.util.List;

/*
 * Tests PROVIDER Pact — MedecinService.
 *
 * Ces tests :
 * 1. Lisent le fichier JSON généré par le Consumer (dans /pacts)
 * 2. Rejouent chaque interaction contre le vrai controller
 * 3. Vérifient que les réponses correspondent au contrat
 *
 * Si le MedecinService change un endpoint → ces tests échouent
 * → on détecte la rupture AVANT la mise en production.
 */
@WebMvcTest(controllers = {MedecinController.class, EquipeMedicaleController.class})
@Provider("MedecinService")
@PactFolder("pacts")
@ActiveProfiles("test")
@ExtendWith(PactVerificationInvocationContextProvider.class) // ← une seule fois ici
@DisplayName("Pact Provider — MedecinService vérifie le contrat PatientService")
class MedecinProviderPactTest {

    @Autowired
    private MockMvc mockMvc;

    // ── Mocks des deux services ────────────────────────────────────
    @MockBean
    private MedecinService medecinService;

    @MockBean
    private EquipeMedicaleService equipeMedicaleService;

    // ── aussi nécessaire pour que MedecinService démarre ──────────
    @MockBean
    private sn.diabete.medecin.client.PatientClient patientClient;

    @BeforeEach
    void setUp(PactVerificationContext context) {
        context.setTarget(new MockMvcTestTarget(mockMvc));
    }

    // Lance la vérification de chaque interaction du contrat
    @TestTemplate
    void verifierContratPact(PactVerificationContext context) {
        context.verifyInteraction();
    }

    // ══════════════════════════════════════════════════════════════
    // ÉTATS MÉDECINS
    // ══════════════════════════════════════════════════════════════

    @State("un médecin avec le numéro MED25ABC existe")
    void etatMedecinAvecNumeroProfessionnel() {
        Mockito.when(medecinService.getMedecinByNumeroProfessionnel("MED25ABC"))
                .thenReturn(creerMedecinResponse(1L, "MED25ABC"));
    }

    @State("aucun médecin avec le numéro MED00XXX")
    void etatMedecinNumeroInexistant() {
        Mockito.when(medecinService.getMedecinByNumeroProfessionnel("MED00XXX"))
                .thenThrow(new ResourceNotFoundException(
                        "Médecin introuvable avec le numéro professionnel : MED00XXX"));
    }

    @State("un médecin avec l'ID 1 existe")
    void etatMedecinId1Existe() {
        Mockito.when(medecinService.getMedecinById(1L))
                .thenReturn(creerMedecinResponse(1L, "MED25ABC"));
    }

    @State("aucun médecin avec l'ID 999")
    void etatMedecinId999Absent() {
        Mockito.when(medecinService.getMedecinById(999L))
                .thenThrow(new ResourceNotFoundException(
                        "Médecin non trouvé avec l'ID : 999"));
    }

    // ══════════════════════════════════════════════════════════════
    // ÉTATS ÉQUIPES
    // ══════════════════════════════════════════════════════════════

    @State("le médecin ID 1 a des équipes médicales")
    void etatMedecin1ADesEquipes() {
        EquipeMedicaleResponse equipe = EquipeMedicaleResponse.builder()
                .id(1L)
                .nom("Equipe Diabetologie") // ← sans accents
                .medecinProprietaireId(1L)
                .medecinsIds(List.of(1L, 2L))
                .build();

        Mockito.when(equipeMedicaleService.getEquipesDuMedecin(1L))
                .thenReturn(List.of(equipe));
    }

    @State("le médecin ID 2 n'a aucune équipe")
    void etatMedecin2AucuneEquipe() {
        Mockito.when(equipeMedicaleService.getEquipesDuMedecin(2L))
                .thenReturn(List.of());
    }

    // ══════════════════════════════════════════════════════════════
    // UTILITAIRES PRIVÉS
    // ══════════════════════════════════════════════════════════════

    private MedecinResponse creerMedecinResponse(Long id, String numero) {
        MedecinResponse medecin = new MedecinResponse();
        medecin.setId(id);
        medecin.setNumeroProfessionnel(numero);
        medecin.setPrenom("Moussa");
        medecin.setNom("Diallo");
        medecin.setSpecialite("Endocrinologie");
        medecin.setTelephone("771234567");
        medecin.setDateNaissance(LocalDate.of(1985, 6, 15));
        medecin.setSexe(Sexe.HOMME); // ← adapte selon ton enum (MASCULIN ou HOMME)
        medecin.setDateEnregistrement(LocalDate.now());
        return medecin;
    }
}