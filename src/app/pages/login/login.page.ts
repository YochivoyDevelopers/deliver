import { Component, OnInit } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { UtilService } from "src/app/services/util.service";
import { NavController } from "@ionic/angular";
import { Router } from "@angular/router";
import { NgForm } from "@angular/forms";
import { login } from "src/app/interfaces/login";
import Swal from "sweetalert2";
import { TranslateService } from "@ngx-translate/core";
import { OneSignal } from "@ionic-native/onesignal/ngx";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"]
})
export class LoginPage implements OnInit {
  login: login = { email: "", password: "" };
  submitted = false;
  isLogin: boolean = false;
  constructor(
    private router: Router,
    private api: ApiService,
    private util: UtilService,
    private navCtrl: NavController,
    private translate: TranslateService,
    private oneSignal: OneSignal
  ) {
    const lng = localStorage.getItem("language");
    if (!lng || lng === null) {
      localStorage.setItem("language", "spanish");
    }
    this.oneSignal.getIds().then(data => {
      console.log("iddddd", data);
      localStorage.setItem("fcm", data.userId);
    });
    this.translate.use(localStorage.getItem("language"));
  }

  ngOnInit() {}

  onLogin(form: NgForm) {
    console.log("form", form);

    this.submitted = true;
    if (form.valid) {
      const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailfilter.test(this.login.email)) {
        this.util.showToast(
          this.util.translate("Please enter valid email"),
          "danger",
          "bottom"
        );
        return false;
      }
      console.log("login");
      this.isLogin = true;
      this.api
        .login(this.login.email, this.login.password)
        .then(userData => {
          console.log(userData);
          if (userData && userData.uid) {
            this.api
              .getProfile(userData.uid)
              .then(data => {
                console.log("data", data);
                this.isLogin = false;
                if (data && data.type === "delivery") {
                  if (data && data.status === "active") {
                    localStorage.setItem("uid", userData.uid);
                    localStorage.setItem("help", userData.uid);
                    const lats = localStorage.getItem("lat");
                    const lngs = localStorage.getItem("lng");
                    //if (lats && lngs) {
                      console.log("can update");
                      const param = {
                        lat: lats,
                        lng: lngs,
                        isActive: true
                      };
                      this.api
                        .updateProfile(localStorage.getItem("uid"), param)
                        .then(data => {
                          console.log(data);
                        })
                        .catch(error => {
                          console.log(error);
                        });
                    //}
                    this.navCtrl.navigateRoot(["/tabs"]);
                  } else {
                    Swal.fire({
                      title: this.util.translate("Error"),
                      text: this.util.translate(
                        "Your are blocked please contact administrator"
                      ),
                      icon: "error",
                      showConfirmButton: true,
                      showCancelButton: true,
                      confirmButtonText: this.util.translate("Need Help?"),
                      backdrop: false,
                      background: "white"
                    }).then(data => {
                      if (data && data.value) {
                        localStorage.setItem("help", userData.uid);
                        this.router.navigate(["inbox"]);
                      }
                    });
                  }
                } else {
                  this.util.showToast(
                    this.util.translate("your not valid user"),
                    "danger",
                    "bottom"
                  );
                }
              })
              .catch(error => {
                this.isLogin = false;
                console.log(error);
                this.util.showToast(`${error}`, "danger", "bottom");
              });
          }
        })
        .catch(err => {
          this.isLogin = false;
          if (err) {
            console.log(err);
            this.util.showToast(`${err}`, "danger", "bottom");
          }
        });
    }
  }

  resetPass() {
    this.router.navigate(["/forgot-password"]);
  }
  register() {
    this.router.navigate(["register"]);
  }
  getClassName() {
    return localStorage.getItem("language");
  }
  changeLng(lng) {
    localStorage.setItem("language", lng);
    this.translate.use(lng);
  }
}
