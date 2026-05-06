package sn.diabete.medecin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients(basePackages = "sn.diabete.medecin.client")
public class MedecinServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(MedecinServiceApplication.class, args);
	}

}
