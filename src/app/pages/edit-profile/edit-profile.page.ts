import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {
  email: any = '';
  phone: any = '';
  name: any = '';
  descriptions: any = '';
  coverImage: any = '';
  constructor(
    private api: ApiService,
    private util: UtilService
  ) { }

  ngOnInit() {
    this.getProfile();
  }

  getProfile() {
    this.api.getProfile(localStorage.getItem('uid')).then((data) => {
      console.log(data);
      if (data) {
        this.name = data.fullname;
        this.descriptions = data.descriptions;
        this.email = data.email;
        this.phone = data.phone;
        this.coverImage = data.coverImage;
      }
    }).catch(error => {
      console.log(error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }
  save() {
    if (this.email === '' || this.descriptions === '' || this.phone === '' || this.name === '') {
      this.util.errorToast('All Fields are required');
      return false;
    }
  }
}
