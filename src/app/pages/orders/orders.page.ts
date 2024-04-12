import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { UtilService } from 'src/app/services/util.service';
@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {

  seg_id = 1;
  orders: any = [];
  oldOrders: any;
  dummy = Array(50);
  constructor(
    private router: Router,
    private api: ApiService,
    private util: UtilService,
    private adb: AngularFirestore) {
    // this.getOrders();
    if (localStorage.getItem('uid')) {
      this.adb.collection('orders', ref =>
        ref.where('driverId', '==', localStorage.getItem('uid'))).snapshotChanges().subscribe((data: any) => {
          console.log('paylaoddddd----->>>>', data);
          if (data) {
            this.getOrders();
          }
        }, error => {
          console.log(error);
        });
    }
  }

  ngOnInit() {

  }

  onClick(val) {
    this.seg_id = val;
  }

  getOrders() {
    this.orders = [];
    this.oldOrders = [];
    this.api.getMyOrders(localStorage.getItem('uid')).then((data: any) => {
      this.dummy = [];
      console.log(data);
      if (data) {
        this.orders = [];
        this.oldOrders = [];
        data.forEach(element => {
          element.order = JSON.parse(element.order);
          if (element.status === 'delivered' || element.status === 'cancel' || element.status === 'rejected') {
            if( element.status != 'rejected') this.oldOrders.push(element);
            
          } else {
            this.orders.push(element);
          }
        });
      }
    }).catch(error => {
      this.dummy = [];
      console.log('eror', error);
    });
  }
  goToOrderDetail(ids) {

    const navData: NavigationExtras = {
      queryParams: {
        id: ids
      }
    };

    this.router.navigate(['/order-detail'], navData);
  }
  getProfilePic(item) {
    return item && item.cover ? item.cover : 'assets/imgs/user.jpg';
  }

  getCurrency() {
    return this.util.getCurrecySymbol();
  }

}
