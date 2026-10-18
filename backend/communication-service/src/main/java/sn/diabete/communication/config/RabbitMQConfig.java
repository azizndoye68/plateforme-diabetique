package sn.diabete.communication.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String CHAT_NOTIFICATION_EXCHANGE = "chat.notification.exchange";
    public static final String CHAT_NOTIFICATION_QUEUE = "chat.notification.queue";
    public static final String CHAT_NOTIFICATION_ROUTING_KEY = "chat.notification.message";

    @Bean
    public TopicExchange chatNotificationExchange() {
        return new TopicExchange(CHAT_NOTIFICATION_EXCHANGE);
    }

    @Bean
    public Queue chatNotificationQueue() {
        return new Queue(CHAT_NOTIFICATION_QUEUE, true);
    }

    @Bean
    public Binding chatNotificationBinding(Queue chatNotificationQueue, TopicExchange chatNotificationExchange) {
        return BindingBuilder
                .bind(chatNotificationQueue)
                .to(chatNotificationExchange)
                .with(CHAT_NOTIFICATION_ROUTING_KEY);
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
