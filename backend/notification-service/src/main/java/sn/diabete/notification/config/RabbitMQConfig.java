package sn.diabete.notification.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // ==============================
    // Existant — Glycémie
    // ==============================
    @Value("${rabbitmq.exchange.glycemie}")
    private String glycemieExchange;

    @Value("${rabbitmq.queue.notification}")
    private String notificationQueue;

    @Value("${rabbitmq.routing-key.notification}")
    private String notificationRoutingKey;

    @Value("${rabbitmq.exchange.chat:chat.notification.exchange}")
    private String chatExchange;

    @Value("${rabbitmq.queue.chat:chat.notification.queue}")
    private String chatQueue;

    @Value("${rabbitmq.routing-key.chat:chat.notification.message}")
    private String chatRoutingKey;

    @Bean
    public TopicExchange glycemieExchange() {
        return new TopicExchange(glycemieExchange);
    }

    @Bean
    public Queue notificationQueue() {
        return new Queue(notificationQueue, true);
    }

    @Bean
    public Binding notificationBinding() {
        return BindingBuilder
                .bind(notificationQueue())
                .to(glycemieExchange())
                .with(notificationRoutingKey);
    }

    @Bean
    public TopicExchange chatExchange() { return new TopicExchange(chatExchange); }

    @Bean
    public Queue chatQueue() { return new Queue(chatQueue, true); }

    @Bean
    public Binding chatBinding() {
        return BindingBuilder.bind(chatQueue()).to(chatExchange()).with(chatRoutingKey);
    }

    // ==============================
    // 🆕 Rendez-vous
    // ==============================
    @Value("${rabbitmq.exchange.rendezvous}")
    private String rendezvousExchange;

    @Value("${rabbitmq.queue.rendezvous-notification}")
    private String rendezvousNotificationQueue;

    @Value("${rabbitmq.routing-key.rendezvous-notification}")
    private String rendezvousNotificationRoutingKey;

    @Bean
    public TopicExchange rendezvousExchange() {
        return new TopicExchange(rendezvousExchange);
    }

    @Bean
    public Queue rendezvousNotificationQueue() {
        return new Queue(rendezvousNotificationQueue, true);
    }

    @Bean
    public Binding rendezvousNotificationBinding() {
        return BindingBuilder
                .bind(rendezvousNotificationQueue())
                .to(rendezvousExchange())
                .with(rendezvousNotificationRoutingKey);
    }

    // ==============================
    // Commun
    // ==============================
    @Bean
    public MessageConverter jsonMessageConverter() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return new Jackson2JsonMessageConverter(mapper);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
