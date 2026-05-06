package sn.diabete.suivimedical.analysis;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import sn.diabete.suivimedical.configuration.GlycemieConfig;
import sn.diabete.suivimedical.entity.Glycemie;
import sn.diabete.suivimedical.enums.NiveauAlerte;
import sn.diabete.suivimedical.enums.TypeAlerte;

@Service
@RequiredArgsConstructor
@Slf4j
public class GlycemieAnalysisService {

    private final GlycemieConfig glycemieConfig;

    /**
     * Analyse une mesure de glycémie et détermine le niveau d'alerte
     */
    public AnalysisResult analyzeGlycemie(Glycemie glycemie) {
        Double valeur = glycemie.getGlycemie();
        GlycemieConfig.Seuils seuils = glycemieConfig.getSeuils();

        AnalysisResult result = new AnalysisResult();
        result.setGlycemie(glycemie);

        // Analyse selon les seuils
        if (valeur < seuils.getHypoSevere()) {
            result.setNiveauAlerte(NiveauAlerte.CRITIQUE);
            result.setTypeAlerte(TypeAlerte.HYPOGLYCEMIE_SEVERE);
            result.setMessage(String.format(
                    "⚠️ URGENT : Hypoglycémie sévère détectée (%.2f g/L). Prenez immédiatement 15g de sucre rapide.",
                    valeur
            ));
            result.setRecommandation("Action immédiate requise : resucrage oral ou injection de glucagon");
            result.setAlerterMedecin(true);
        }
        else if (valeur < seuils.getHypo()) {
            result.setNiveauAlerte(NiveauAlerte.ATTENTION);
            result.setTypeAlerte(TypeAlerte.HYPOGLYCEMIE);
            result.setMessage(String.format(
                    "⚠️ Hypoglycémie détectée (%.2f g/L). Prenez 15g de sucre rapide.",
                    valeur
            ));
            result.setRecommandation("Consommez du sucre rapide et surveillez");
            result.setAlerterMedecin(false);
        }
        else if (valeur > seuils.getHyperSevere()) {
            result.setNiveauAlerte(NiveauAlerte.CRITIQUE);
            result.setTypeAlerte(TypeAlerte.HYPERGLYCEMIE_SEVERE);
            result.setMessage(String.format(
                    "⚠️ URGENT : Hyperglycémie sévère détectée (%.2f g/L). Contactez votre médecin.",
                    valeur
            ));
            result.setRecommandation("Buvez de l'eau, vérifiez vos cétones, contactez votre médecin");
            result.setAlerterMedecin(true);
        }
        else if (valeur > seuils.getHyper()) {
            result.setNiveauAlerte(NiveauAlerte.ATTENTION);
            result.setTypeAlerte(TypeAlerte.HYPERGLYCEMIE);
            result.setMessage(String.format(
                    "⚠️ Hyperglycémie détectée (%.2f g/L). Surveillez votre alimentation.",
                    valeur
            ));
            result.setRecommandation("Buvez de l'eau, évitez les sucres rapides");
            result.setAlerterMedecin(false);
        }
        else {
            result.setNiveauAlerte(NiveauAlerte.NORMAL);
            result.setTypeAlerte(null);
            result.setMessage(String.format("✅ Glycémie normale (%.2f g/L).", valeur));
            result.setRecommandation("Maintenez vos bonnes habitudes");
            result.setAlerterMedecin(false);
        }

        log.info("Analyse glycémie patient {} : {} - {}",
                glycemie.getPatientId(),
                result.getNiveauAlerte(),
                result.getTypeAlerte());

        return result;
    }

    /**
     * Résultat de l'analyse
     */
    @lombok.Data
    public static class AnalysisResult {
        private Glycemie glycemie;
        private NiveauAlerte niveauAlerte;
        private TypeAlerte typeAlerte;
        private String message;
        private String recommandation;
        private Boolean alerterMedecin;
    }
}
