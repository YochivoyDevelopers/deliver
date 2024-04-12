import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { NavController } from '@ionic/angular';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  seg_id = 1;
  name: any = '';
  avtar: any = '';
  phone: any = '';
  review: any = [];
  constructor(
    private router: Router,
    private api: ApiService,
    private navCtrl: NavController) {

  }

  ngOnInit() {
    this.getProfile();
  }
  getProfile() {
    this.api.getProfile(localStorage.getItem('uid')).then((data) => {
      console.log('data', data);
      if (data) {
        this.name = data.fullname;
        this.avtar = data.coverImage;
        this.phone = data.phone;
        this.api.getMyReviews(localStorage.getItem('uid')).then(data => {
          console.log('-->-->', data);
          if (data && data.length) {
            this.review = data;
          }
        }).catch(error => {
          console.log(error);
        });
      }
    }).catch(error => {
      console.log(error);
    });
  }

  changeSegment(val) {
    this.seg_id = val;
  }

  goToOrder() {
    this.router.navigate(['/tabs']);
  }

  goToEditProfile() {
    this.router.navigate(['/edit-profile']);
  }

  goToNotification() {
    this.router.navigate(['/notifications']);
  }
  logout() {
    this.api.logout().then((data) => {
      console.log(data);
      const param = {
        isActive: false
      };
      this.api
        .updateProfile(localStorage.getItem("uid"), param)
        .then(data => {
          console.log(data);
          this.navCtrl.navigateRoot('login'); 
        })
        .catch(error => {
          console.log(error);
        });
     
    })
  }
}
