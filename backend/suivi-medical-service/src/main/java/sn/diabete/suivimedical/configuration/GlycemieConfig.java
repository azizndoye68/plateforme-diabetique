package sn.diabete.suivimedical.configuration;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "glycemie")
@Data
public class GlycemieConfig {

    private Seuils seuils = new Seuils();

    @Data
    public static class Seuils {
        private Double hypoSevere = 0.50;
        private Double hypo = 0.70;
        private Double normalMin = 0.70;
        private Double normalMax = 1.80;
        private Double hyper = 1.80;
        private Double hyperSevere = 2.50;
    }
}

