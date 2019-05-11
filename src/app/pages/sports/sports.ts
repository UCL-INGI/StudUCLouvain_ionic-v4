import { UtilsService } from './../../services/utils-services/utils-services';
/*
    Copyright (c)  Université catholique Louvain.  All rights reserved
    Authors :  Daubry Benjamin & Marchesini Bruno
    Date : July 2018
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
import { AlertController, IonItemSliding, IonList,
  ModalController, ToastController, NavController} from '@ionic/angular';
import { Calendar } from '@ionic-native/calendar/ngx';
import { FormControl } from '@angular/forms';
import { UserService } from '../../services/utils-services/user-service';
import { SportsService } from '../../services/rss-services/sports-service';
import { ConnectivityService } from '../../services/utils-services/connectivity-service';
import { LoaderService } from '../../services/utils-services/loader-service';
import { SportItem } from '../../entity/sportItem';
import { debounceTime } from 'rxjs/operators';
import { SportsFilterPage } from './sports-filter/sports-filter';

@Component({
  selector: 'page-sports',
  templateUrl: 'sports.html'
})

export class SportsPage {
  @ViewChild('sportsList', { read: IonList }) sportsList: IonList;

  sports: Array<SportItem> = [];
  teams: Array<SportItem> = [];
  searching: any = false;
  segment = 'all';
  shownSports = 0;
  shownTeams = 0;
  title: any;
  searchTerm: string = '';
  searchControl: FormControl;
  filters : any = [];
  filtersT : any = [];
  excludedFilters : any = [];
  excludedFiltersT : any = [];
  displayedSports : Array<SportItem> = [];
  displayedSportsD :any = [];
  dateRange: any = 7;
  dateLimit: Date = new Date();
  campus:string;
  shownGroup = null;
  loading;
  nosport:any = false;
  noteams:any = false;
  texts = {
    'FAV': 'SPORTS.MESSAGEFAV',
    'FAV2': 'SPORTS.FAVADD',
    'FAV3': 'SPORTS.MESSAGEFAV2',
    'CANCEL': 'SPORTS.CANCEL',
    'DEL': 'SPORTS.DEL',
  }

  constructor(
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    private sportsService: SportsService,
    public user: UserService,
    public toastCtrl: ToastController,
    private calendar: Calendar,
    public connService : ConnectivityService,
    private loader: LoaderService,
    public navCtrl: NavController,
    private utilsServices: UtilsService)
  {
    this.searchControl = new FormControl();
  }

  /*update the date with in real time value, load sport and display them*/
  ngOnInit() {
    this.updateDateLimit();
    //Check connxion, if it's ok, load and display sports
    if(this.connService.isOnline()) {
      this.loadSports();
      this.searchControl.valueChanges.pipe(debounceTime(700)).subscribe(search => {
        this.searching = false;
        this.updateDisplayedSports();
      });
      this.loader.present("Please wait..");
      //this.nosport=true;
    }
    //If not go back to previous page and pop an alert
    else{
      this.navCtrl.pop();
      this.connService.presentConnectionAlert();
    }
  }

  /*Reload sport after refreshing the page*/
  public doRefresh(refresher) {
    this.loadSports();
    refresher.target.complete();
  }

  public onSearchInput(){
    this.searching = true;
  }

  /*Load sports to display*/
  public loadSports() {
    this.searching = true;
    this.sportsList && this.sportsList.closeSlidingItems();
    this.campus = this.user.campus;
    //Check the connexion, if it's ok, load them else return to previous page and display an alert
    if(this.connService.isOnline()) {
      //get sports for all students
      this.sportsService.getSports(this.segment).then(
        result => {
          this.assignDatas(false, result);
          this.updateDisplayedSports();
      })
      this.sportsService.getTeams(this.segment).then(
        result => {
          this.assignDatas(true, result);
          this.updateDisplayedSports();
      })
    } else {
      this.searching = false;
      this.navCtrl.pop();
      this.connService.presentConnectionAlert();
    }
  }

  private assignDatas(isTeam: boolean, result: any) {
    if (isTeam == true) {
      this.teams = result.sports;
      this.shownTeams = result.shownSports;
      this.filtersT = result.categories;
    } else {
      this.sports = result.sports;
      this.shownSports = result.shownSports;
      this.filters = result.categories;
    }
    this.searching = false;
    if (isTeam == true) this.noteams = this.sports.length == 0;
    else this.nosport = this.sports.length == 0;
  }

  /*Sort sports BY DAY*/
  public changeArray(array){
    var groups = array.reduce(function(obj,item){
      obj[item.jour] = obj[item.jour] || [];
      obj[item.jour].push(item);
      return obj;
    }, {});
    var sportsD = Object.keys(groups).map(function(key){
    return {jour: key, name: groups[key]};
    });
    return sportsD;
  }

  /*Display or close the group of sports for one day*/
  toggleGroup(group) {
      if (this.isGroupShown(group)) {
          this.shownGroup = null;
      } else {
          this.shownGroup = group;
      }
  }

  /*Check if the list is shown or not*/
  isGroupShown(group) {
      return this.shownGroup === group;
  }

  /*Display the good list of sports according to the tab*/
  public updateDisplayedSports() {
    this.searching = true;
    this.sportsList && this.sportsList.closeSlidingItems();

    if (this.segment === 'all') { //List of sports for all students
      this.filterDisplayedSports(this.sports);
    }
    else if (this.segment === 'favorites') { //list of sports put in favorite
      let favSports = [];
      this.sports.filter((item) => {
        if(item.favorite || this.user.hasFavorite(item.guid)) {
          if(item.sport.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1) {
            favSports.push(item);
          }
        }
      });
      this.displayedSports = favSports;
    }
    else if (this.segment === 'team') { //List of sports for university teams
      this.filterDisplayedSports(this.teams);
    }

    this.shownSports = this.displayedSports.length;
    this.searching = false;
    this.displayedSportsD = this.changeArray(this.displayedSports);
    this.loader.dismiss();
  }

  private filterDisplayedSports(items: Array<SportItem>) {
    this.displayedSports = this.utilsServices.filterItems('sport', items, this.excludedFilters, this.dateLimit, this.searchTerm);
  }

  /*Display a modal to select as filter only the sports that the user want to see*/
  async presentFilter() {
    if(this.filters === undefined){
      this.filters = [];
    }
    if(this.filtersT === undefined){
      this.filtersT = [];
    }
    let cat;
    let exclude;
    if(this.segment === 'all'){
      cat = this.filters;
      exclude = this.excludedFilters;
    }
    if(this.segment === 'team'){ 
      cat = this.filtersT;
      exclude = this.excludedFiltersT;
    }
    //Create a modal in which the filter will be by the SportsFilterPage
    let modal = await this.modalCtrl.create(
      {
        component: SportsFilterPage,
        componentProps: { excludedFilters : exclude, filters : cat, dateRange : this.dateRange}
      })
      await modal.present();
    //Applied changing of date range when dismiss the modal
    await modal.onDidDismiss().then((data) => {
      if (data) {
        data = data.data;
        let tmpRange = data[1];
        if(tmpRange !== this.dateRange) {
          this.dateRange = tmpRange;
          this.updateDateLimit();
        }
        let newExclude = data[0];
        if(this.segment === 'all') this.excludedFilters = newExclude;
        if(this.segment === 'team') this.excludedFiltersT = newExclude;
        this.updateDisplayedSports();
      }
    });
  }

  /*Update the dateLimit when that is changed by the filter*/
  private updateDateLimit(){
    let today = new Date();
    this.dateLimit = new Date(today.getFullYear(), today.getMonth(), today.getUTCDate()+this.dateRange);
  }

  /*Add a sport to calendar of the smartphone*/
  addToCalendar(slidingItem: IonItemSliding, itemData: SportItem){
    let options:any = {
      firstReminderMinutes:30
    };
    this.calendar.createEventWithOptions(itemData.sport, itemData.lieu,
      itemData.salle, itemData.date, itemData.hfin, options).then(() => {
        let toast = this.toastCtrl.create({
          message: 'Sport créé',
          duration: 3000
        }).then(toast => toast.present());
        slidingItem.close();
      });
  }

  /*Add a sport to favorite, each slot for the day selected*/
  addFavorite(slidingItem: IonItemSliding, itemData: SportItem) {
    this.utilsServices.addFavorite(slidingItem, itemData, this.texts, this.updateDisplayedSports.bind(this));
  }

  /*Remove a sport of the favorites*/
  removeFavorite(slidingItem: IonItemSliding, itemData: SportItem, title: string) {
    this.utilsServices.removeFavorite(slidingItem, itemData, title, this.texts, this.updateDisplayedSports.bind(this));
  }
}
