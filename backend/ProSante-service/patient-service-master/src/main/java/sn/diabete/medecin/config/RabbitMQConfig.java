package sn.diabete.medecin.config;

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