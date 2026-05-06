package sn.diabete.notification.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "auth-service")
public interface AuthClient {

    @GetMapping("/api/auth/users/{userId}/email")
    String getUserEmail(@PathVariable("userId") Long userId);
}
