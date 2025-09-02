import { Injectable } from "@nestjs/common";
import { EventsGateway } from "src/websocket/events.gateway";

@Injectable()
export class EmailService {
    constructor( private eventsGateway: EventsGateway ) {}

    async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
        try {
            // when gateway is restored, emit 'pending' status here
            this.eventsGateway.emitEmailStatus('pending', userEmail);
            await new Promise(resolve => setTimeout(resolve, 2500));
            console.log(`Sending welcome email to ${userEmail} for ${userName}`);

            // simulate email success/failure
            const success = Math.random() > 0.1; // 90% success rate

            if (success) {
                // emit 'success' 
                this.eventsGateway.emitEmailStatus('success', userEmail);
                console.log(`Email successfully sent to ${userEmail}`);
            } else {
                // emit 'failed' 
                this.eventsGateway.emitEmailStatus('failed', userEmail);
                console.log(`Email failed to successfully send to ${userEmail}`);
            }
        } catch (err) {
            // emit 'failed' 
            this.eventsGateway.emitEmailStatus('failed', userEmail);
            console.error(`Error sending email to ${userEmail}:`, err);
        }
    }
}
