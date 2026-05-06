package sn.diabete.suivimedical;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients(basePackages = "sn.diabete.suivimedical.client")
public class SuiviMedicalServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(SuiviMedicalServiceApplication.class, args);
	}

}
