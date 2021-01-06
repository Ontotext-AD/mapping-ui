import {MessageHandler} from 'src/app/services/message-hanglers/message-handler';
import {TranslateService} from '@ngx-translate/core';
import {Injectable} from '@angular/core';
import {MessageType} from 'src/app/utils/message-type';

/**
 * The service handles a message of type {@link MessageType.LANGUAGE}
 * The value part of the message must contain the short language string
 * (e.g. 'en', 'de')
 */
@Injectable({
  providedIn: 'root',
})
export class LanguageMessageHandler implements MessageHandler {
  constructor(private translateService: TranslateService) {
  }

  public getType(): string {
    return MessageType.LANGUAGE;
  }

  public handleMessage(message) {
    if (this.translateService.getLangs().includes(message.value)) {
      this.translateService.use(message.value);
    }
  }
}
