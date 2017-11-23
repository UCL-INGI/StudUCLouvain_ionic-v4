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

import { Component, trigger, state, style, animate, transition } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RepertoireService } from '../../../providers/wso2-services/repertoire-service';
import { EmployeeItem } from '../../../app/entity/employeeItem';
import { ConnectivityService } from '../../../providers/utils-services/connectivity-service';

/**
 * Generated class for the EmployeeDetailsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-employee-details',
  templateUrl: 'employee-details.html',
  animations: [
    trigger('expand', [
      state('true', style({ height: '45px' })),
      state('false', style({ height: '0'})),
      transition('void => *', animate('0s')),
      transition('* <=> *', animate('250ms ease-in-out'))
    ])
  ]
})
export class EmployeeDetailsPage {
  empDetails: EmployeeItem;
  shownGroup = null;
  searching: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public repService: RepertoireService, public connService: ConnectivityService) {
    this.empDetails = navParams.get('lib');
    this.searching = true;
    if(this.connService.isOnline()) {
      this.repService.loadEmpDetails(this.empDetails).then(
        res => {
          let result:any = res;
          this.empDetails = result.empDetails;
          this.searching = false;
        }
      );
    } else {
      this.searching = false;
      this.connService.presentConnectionAlert();
    }
  }

  toggleGroup(group) {
      if (this.isGroupShown(group)) {
          this.shownGroup = null;
      } else {
          this.shownGroup = group;
      }
  }

  isGroupShown(group) {
      return this.shownGroup === group;
  }


  ionViewDidLoad() {
  }

  openPage(url: string) {
    //InAppBrowser.open(url, '_blank');
    window.open(url, '_blank');
  }
}
