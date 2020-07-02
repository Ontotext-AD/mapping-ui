import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {filter} from 'rxjs/operators';
import {ChannelName} from 'src/app/services/channel-name.enum';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private subject = new Subject<Message>();

  constructor() {
  }

  publish(channel: ChannelName, message?: any) {
    this.subject.next(new Message(channel, message));
  }

  read(channel): Observable<Message> {
    return this.subject.asObservable().pipe(filter((c) => c.getChannel() === channel));
  }
}

class Message {
  private channel: ChannelName;
  private message: any;

  constructor(channel: ChannelName, message?: any) {
    this.channel = channel;
    this.message = message;
  }

  getChannel() {
    return this.channel;
  }

  getMessage() {
    return this.message;
  }
}
