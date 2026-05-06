package sn.diabete.suivimedical.configuration;

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

    @Value("${rabbitmq.exchange.glycemie}")
    private String glycemieExchange;

    @Value("${rabbitmq.queue.notification}")
    private String notificationQueue;

    @Value("${rabbitmq.routing-key.notification}")
    private String notificationRoutingKey;

    /**
     * Exchange pour les événements de glycémie
     */
    @Bean
    public TopicExchange glycemieExchange() {
        return new TopicExchange(glycemieExchange);
    }

    /**
     * Queue pour les notifications
     */
    @Bean
    public Queue notificationQueue() {
        return new Queue(notificationQueue, true); // durable = true
    }

    /**
     * Binding entre l'exchange et la queue
     */
    @Bean
    public Binding notificationBinding() {
        return BindingBuilder
                .bind(notificationQueue())
                .to(glycemieExchange())
                .with(notificationRoutingKey);
    }

    /**
     * Convertisseur JSON pour sérialiser/désérialiser les événements
     */
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    /**
     * Template RabbitMQ configuré avec le convertisseur JSON
     */
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}