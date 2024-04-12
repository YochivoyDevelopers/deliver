import { Component } from "@angular/core";

import { Platform, ActionSheetController } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { ApiService } from "src/app/services/api.service";
import { TranslateService } from "@ngx-translate/core";
import { OneSignal } from "@ionic-native/onesignal/ngx";
import { environment } from "src/environments/environment";
import { NativeAudio } from "@ionic-native/native-audio/ngx";
import { UtilService } from "./services/util.service";
@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"]
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private geolocation: Geolocation,
    private api: ApiService,
    private translate: TranslateService,
    private oneSignal: OneSignal,
    private nativeAudio: NativeAudio,
    private actionSheetController: ActionSheetController,
    private util: UtilService
  ) {
    const lng = localStorage.getItem("language");
    console.log("----------", lng);
    if (!lng || lng === null) {
      localStorage.setItem("language", "en");
    }
    this.translate.use(localStorage.getItem("language"));
    this.initializeApp();
  }
  updateLocation(lat, lng) {
    if (localStorage.getItem("uid")) {
      // console.log('can update');
      const param = {
        lat: lat,
        lng: lng
      };
      this.api
        .updateProfile(localStorage.getItem("uid"), param)
        .then(data => {
          // console.log(data);
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
  getLocation() {
    this.geolocation
      .getCurrentPosition()
      .then(resp => {
        // console.log(resp);
        // console.log('current lat', resp);
        localStorage.setItem("lat", resp.coords.latitude.toString());
        localStorage.setItem("lng", resp.coords.longitude.toString());
        this.updateLocation(resp.coords.latitude, resp.coords.longitude);
      })
      .catch(error => {
        console.log("Error getting location", error);
      });

    let watch = this.geolocation.watchPosition();
    watch.subscribe(data => {
      console.log("aquiiiiiiiiiii",data)
      // console.log('live update', data);
      localStorage.setItem("lat", data.coords.latitude.toString());
      localStorage.setItem("lng", data.coords.longitude.toString());
      this.updateLocation(data.coords.latitude, data.coords.longitude);
    });
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: this.util.translate("New Notification"),
      mode: "md",
      buttons: [
        {
          text: this.util.translate("OK"),
          icon: "volume-mute",
          handler: () => {
            console.log("Delete clicked");
            this.nativeAudio.stop("audio").then(
              () => console.log("done"),
              () => console.log("error")
            );
          }
        },
        {
          text: this.util.translate("Cancel"),
          icon: "close",
          role: "cancel",
          handler: () => {
            console.log("Cancel clicked");
            this.nativeAudio.stop("audio").then(
              () => console.log("done"),
              () => console.log("error")
            );
          }
        }
      ]
    });

    await actionSheet.present();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      setTimeout(async () => {
        await this.oneSignal.startInit(
          environment.onesignal.appId,
          environment.onesignal.googleProjectNumber
        );
        this.oneSignal.getIds().then(data => {
          console.log("iddddd", data);
          localStorage.setItem("fcm", data.userId);
        });
        this.oneSignal.enableSound(true);
        await this.oneSignal.endInit();
      }, 1000);
      this.nativeAudio
        .preloadSimple("audio", "assets/alert.mp3")
        .then(
          (data: any) => {
            console.log("dupletx", data);
          },
          error => {
            console.log(error);
          }
        )
        .catch(error => {
          console.log(error);
        });
      this.oneSignal.handleNotificationReceived().subscribe(data => {
        console.log("got order", data);
        this.nativeAudio
          .play("audio", () => console.log("audio is done playing"))
          .catch(error => console.log(error));
        this.nativeAudio.setVolumeForComplexAsset("audio", 1);
        this.presentActionSheet();
      });
      this.oneSignal.inFocusDisplaying(2);
      this.getLocation();
    });
  }
}
