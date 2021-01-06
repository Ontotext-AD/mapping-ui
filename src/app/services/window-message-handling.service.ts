import {LanguageMessageHandler} from 'src/app/services/message-hanglers/language-message-handler';
import {MessageHandler} from 'src/app/services/message-hanglers/message-handler';
import {Injectable} from '@angular/core';

/**
 * The service helps with subscription and handling of massages coming from
 * window parent
 */
@Injectable({
  providedIn: 'root',
})
export class WindowMessageHandlingService {
  messageTypeToHandlersMap: Map<string, MessageHandler> = new Map<string, MessageHandler>();

  constructor(private languageMessageHandler: LanguageMessageHandler) {
    this.messageTypeToHandlersMap.set(languageMessageHandler.getType(), languageMessageHandler);
  }

  subscribeToWindowParentMessageEvent() {
    window.parent.addEventListener('message', (e) => {
      this.handleMessage(e.data);
    });
  }

  handleMessage(message: any): void {
    if (message.type && this.messageTypeToHandlersMap.has(message.type)) {
      this.messageTypeToHandlersMap.get(message.type).handleMessage(message);
    }
  }
}
