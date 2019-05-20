/**
    Copyright (c)  Université catholique Louvain.  All rights reserved
    Authors: Benjamin Daubry & Bruno Marchesini and Jérôme Lemaire & Corentin Lamy
    Date: 2018-2019
    This file is part of Stud.UCLouvain
    Licensed under the GPL 3.0 license. See LICENSE file in the project root for full license information.

    Stud.UCLouvain is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Stud.UCLouvain is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Stud.UCLouvain.  If not, see <http://www.gnu.org/licenses/>.
*/
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { EventItem } from '../../../entity/eventItem';
import { AlertService } from '../../../services/utils-services/alert-service';
import { UserService } from '../../../services/utils-services/user-service';

@Component({
  selector: 'page-events-details',
  templateUrl: 'events-details.html'
})
export class EventsDetailsPage {
  event: EventItem;

  constructor(public navCtrl: NavController,
    public user: UserService,
    private translateService: TranslateService,
    public toastCtrl: ToastController,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService
  ) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.event = this.router.getCurrentNavigation().extras.state.items;
      }
    });
  }

  /*OPEN THE EXTERNAL PAGE OF THE EVENT*/
  public openPage(url: string) {
    window.open(url, '_blank');
  }

  /*ADD EVENT TO FAVORITE*/
  public addFavorite(event: EventItem) {
    let message: string;
    this.translateService.get('EVENTS.MESSAGEFAV2').subscribe((res: string) => { message = res; });

    if (!this.user.hasFavorite(event.guid)) {
      this.user.addFavorite(event.guid);
      this.alertService.presentToast(message);
    }

  }

}