import { Component, OnInit, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { ApiService } from 'src/app/services/api.service';
@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.page.html',
  styleUrls: ['./inbox.page.scss'],
})
export class InboxPage implements OnInit {
  @ViewChild('scrollMe', { static: false }) private myScrollContainer: ElementRef;
  @ViewChildren('messages') messagesList: QueryList<any>;

  message: any;
  messages: any = [];
  id: any;
  count: any = 0;
  constructor(
    private adb: AngularFirestore,
    private api: ApiService
  ) {
    this.id = 'admin' + localStorage.getItem('help');
    this.getMessages();
    this.adb.collection('users').doc(localStorage.getItem('help')).snapshotChanges().subscribe((data) => {
      this.api.getProfile(localStorage.getItem('help')).then((info) => {
        console.log(info);
        if (info && info.count) {
          this.count = info.count;
        } else {
          this.count = 0;
        }
      }).catch(error => {
        console.log(error);
      });
    });
  }

  getMessages() {
    this.adb.collection('messages').doc(this.id).collection('chats').snapshotChanges().subscribe((data) => {
      console.log(data);
      this.api.getMessages(this.id).then(info => {
        console.log(info);
        info.sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        this.messages = info;
        console.log('info', this.messages);
        this.scrollToBottomOnInit();
      }).catch(error => {
        console.log(error);
      });
    }, error => {
      console.log(error);
    });
  }
  ngOnInit() {
  }

  send() {
    console.log('this.mess', this.message);

    if (this.message && this.id) {
      const text = this.message;
      this.message = '';
      console.log('send');
      const id = Math.floor(100000000 + Math.random() * 900000000);
      const data = {
        msg: text,
        from: 'user',
        timestamp: new Date().toISOString(),
        id: this.id,
        docId: id
      };
      this.adb.collection('messages').doc(this.id).collection('chats').doc(id.toString()).set(data).then((data) => {
        console.log('sent', data);
      }).catch(error => {
        console.log(error);
      });

      const count = {
        count: this.count + 1,
      };
      this.api.updateProfile(localStorage.getItem('help'), count).then(data => {
        console.log('updated', data);
      }).catch(error => {
        console.log(error);
      });
    }
  }
  scrollToBottomOnInit() {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

}
