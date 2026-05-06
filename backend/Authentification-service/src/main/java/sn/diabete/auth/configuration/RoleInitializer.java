package sn.diabete.auth.configuration;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import sn.diabete.auth.entity.Role;
import sn.diabete.auth.entity.TypeRole;
import sn.diabete.auth.repository.RoleRepository;

@Component
@RequiredArgsConstructor
public class RoleInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        for (TypeRole typeRole : TypeRole.values()) {
            roleRepository.findByNom(typeRole)
                    .orElseGet(() ->
                            roleRepository.save(
                                    Role.builder()
                                            .nom(typeRole)
                                            .build()
                            )
                    );
        }
    }
}
