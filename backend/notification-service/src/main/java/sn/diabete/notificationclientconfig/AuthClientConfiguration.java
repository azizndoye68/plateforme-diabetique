package sn.diabete.notificationclientconfig;

import feign.RequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AuthClientConfiguration {

    @Bean
    RequestInterceptor authServiceKeyInterceptor(
            @Value("${auth.internal-api-key}") String serviceKey) {
        return template -> template.header("X-Internal-Service-Key", serviceKey);
    }
}
