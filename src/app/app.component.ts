/*
    Copyright (c)  Université catholique Louvain.  All rights reserved
    Authors :  Jérôme Lemaire and Corentin Lamy
    Date : July 2017
    This file is part of UCLCampus
    Licensed under the GPL 3.0 license. See LICENSE file in the project root for full license information.

    UCLCampus is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    UCLCampus is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with UCLCampus.  If not, see <http://www.gnu.org/licenses/>.
*/

import { Component, ViewChild } from '@angular/core';
import { MenuController, Nav, Platform, AlertController } from 'ionic-angular';
import { Device } from '@ionic-native/device';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
//import { Market } from '@ionic-native/market';
import { AppAvailability } from '@ionic-native/app-availability';
import { InAppBrowser } from '@ionic-native/in-app-browser';

import { EventsPage } from '../pages/events/events';
import { MobilityPage } from '../pages/mobility/mobility';
import { LibrariesPage } from '../pages/library/libraries';
import { NewsPage } from '../pages/news/news';
import { RestaurantPage } from '../pages/restaurant/restaurant';
import { StudiesPage } from '../pages/studies/studies';
import { MapPage } from '../pages/map/map';
import { HelpDeskPage } from '../pages/help-desk/help-desk';
import { SportsPage } from '../pages/sports/sports';
import { HomePage } from '../pages/home/homeC';
import { GuindaillePage } from '../pages/guindaille2-0/guindaille2-0';
import { UserService } from '../providers/utils-services/user-service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage = HomePage;
  alertPresented: any;
  page: any;
  homePage;
  campusPages: Array<{title: string, component: any, icon: any,
    iosSchemaName: string, androidPackageName: string,
    appUrl: string, httpUrl: string}>;
  studiePages: Array<{title: string, component: any, icon: any,
    iosSchemaName: string, androidPackageName: string,
    appUrl: string, httpUrl: string}>;
  toolPages: Array<{title: string, component: any, icon: any,
    iosSchemaName: string, androidPackageName: string,
    appUrl: string, httpUrl: string}>;

  constructor(public platform: Platform,
    public menu: MenuController,
    //public market: Market,
    private appAvailability : AppAvailability,
    private iab: InAppBrowser,
    private device: Device,
    private splashscreen: SplashScreen,
    private alertCtrl : AlertController,
    private user: UserService,
    private statusBar: StatusBar
  ) {
    this.user.getCampus();
    console.log(this.user.campus);
    this.alertPresented = false;
    this.initializeApp();
    this.homePage =
      {title: 'Accueil', component: HomePage, icon: 'home',
      iosSchemaName: null, androidPackageName: null,
      appUrl: null, httpUrl: null}
    ;
    this.campusPages =[
      { title: 'Actualités', component: NewsPage, icon: 'paper',
        iosSchemaName: null, androidPackageName: null,
        appUrl: null, httpUrl: null },
      { title: 'Evenements', component: EventsPage, icon: 'calendar',
        iosSchemaName: null, androidPackageName: null,
        appUrl: null, httpUrl: null  },
      { title: 'Sports', component: SportsPage, icon: 'football',
        iosSchemaName: null, androidPackageName: null,
        appUrl: null, httpUrl: null  },

    ];
    this.studiePages =[
      { title: 'Etudes', component: StudiesPage, icon: 'school',
        iosSchemaName: null, androidPackageName: null,
        appUrl: null, httpUrl: null  },
      { title: 'Bibliothèques', component: LibrariesPage, icon: 'book',
        iosSchemaName: null, androidPackageName: null,
        appUrl: null, httpUrl: null  },
      { title: 'Service d\'aide', component: HelpDeskPage,
        icon: 'information-circle', iosSchemaName: null,
        androidPackageName: null, appUrl: null, httpUrl: null }
    ];
    this.toolPages =[
    //{ title: 'Repertoire UCL', component: NewsPage, icon: 'contact',
    //     iosSchemaName: null, androidPackageName: null,
    //     appUrl: null, httpUrl: null  },
      { title: 'Guindaille2.0', component: GuindaillePage, icon: 'water',
        iosSchemaName: null, androidPackageName: null,
        appUrl: null, httpUrl: null  },
      { title: 'Carte', component: MapPage, icon: 'map',
        iosSchemaName: null, androidPackageName: null,
        appUrl: null, httpUrl: null  },
      { title: 'Restaurants', component: RestaurantPage, icon : 'restaurant',
        iosSchemaName: 'com.apptree.resto4u',
        androidPackageName: 'com.apptree.resto4u',
        appUrl: 'apptreeresto4u://',
        httpUrl: 'https://uclouvain.be/fr/decouvrir/resto-u' },
      { title: 'Mobilité', component: MobilityPage, icon : 'car',
        iosSchemaName: 'net.commuty.mobile',
        androidPackageName: 'net.commuty.mobile',
        appUrl: 'commutynet://', httpUrl: 'https://app.commuty.net/sign-in' }
      //{ title: 'Login Test', component: LoginPage, icon: 'contact',
        // iosSchemaName: null, androidPackageName: null,
        // appUrl: null, httpUrl: null }
    ];


  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashscreen.hide();
    });

    // Confirm exit
    this.platform.registerBackButtonAction(() => {
        if (this.nav.length() == 1) {
          this.confirmExitApp();
        } else {
          this.nav.pop();
        }

    });
  }

  confirmExitApp() {
    if(this.page == this.homePage){
      if(!this.alertPresented){
        this.alertPresented = true;
        let confirmAlert = this.alertCtrl.create({
            title: "Fermeture",
            message: "Désirez-vous quitter l'application ?",
            buttons: [
                {
                    text: 'Annuler',
                    handler: () => {
                      this.alertPresented = false;
                    }
                },
                {
                    text: 'Quitter',
                    handler: () => {
                        this.platform.exitApp();
                    }
                }
            ]
        });
        confirmAlert.present();
    }
  }
  else this.openRootPage(this.homePage);
}

  openRootPage(page) {

    // close the menu when clicking a link from the menu
    this.menu.close();
    this.page = page;
    if(page.iosSchemaName != null && page.androidPackageName != null){
      this.launchExternalApp(page.iosSchemaName, page.androidPackageName, page.appUrl, page.httpUrl);
    }
    this.nav.setRoot(page.component, {title: page.title});

  }

  launchExternalApp(iosSchemaName: string, androidPackageName: string, appUrl: string, httpUrl: string) {
	  let app: string;
    let storeUrl:string;
  	if (this.device.platform === 'iOS') {
  		app = iosSchemaName;
      storeUrl=httpUrl;
  	} else if (this.device.platform === 'Android') {
  		app = androidPackageName;
      storeUrl= 'market://details?id='+ app;
  	} else {
  		const browser = this.iab.create(httpUrl, '_system');
      browser.close();
  	}
  	this.appAvailability.check(app).then(
  		() => { // success callback
  			const browser = this.iab.create(appUrl, '_system');
        browser.close();
  		},
  		() => { // error callback
  			//this.market.open(app);
  		}
  	);
  }

}
