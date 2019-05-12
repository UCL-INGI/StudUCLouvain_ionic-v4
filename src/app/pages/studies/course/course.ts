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

import { Component } from '@angular/core';
import { NavController, IonItemSliding, ToastController, AlertController, ModalController  } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { CourseService } from '../../../services/studies-services/course-service';
import { UserService } from '../../../services/utils-services/user-service';

import { Course } from '../../../entity/course';
import { Activity } from '../../../entity/activity'
import { Calendar } from '@ionic-native/calendar/ngx';
import { ModalInfoPage } from './modal-info/modal-info';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilsService } from 'src/app/services/utils-services/utils-services';

@Component({
  selector: 'page-course',
  templateUrl: 'course.html'
})

export class CoursePage {
  sessionId : string;
  course : Course;
  year;
  segment = 'Cours magistral';
  slotTP:string = "no";
  shownGroup = null;
  slotCM:string = "no";
  displayedActi : Array<Activity> = [];
  courseSorted : {cm:Array<Activity>, tp:Array<Activity>, ex:Array<Activity>};
  noTP:boolean;
  noCM:boolean;
  noEx:boolean;


  constructor(
    public navCtrl: NavController,
    public courseService: CourseService,
    private calendar: Calendar,
    public toastCtrl: ToastController,
    public userS:UserService,
    public modalCtrl: ModalController,
    private alertCtrl : AlertController,
    private translateService: TranslateService,
    private route: ActivatedRoute, 
    private router: Router,
    private utilsServices: UtilsService
  )
  {
    this.route.queryParams.subscribe(params => {

      if (this.router.getCurrentNavigation().extras.state) {
        this.sessionId = this.router.getCurrentNavigation().extras.state.sessionId;
        this.course = this.router.getCurrentNavigation().extras.state.course;
        this.year = this.router.getCurrentNavigation().extras.state.year;
        this.courseSorted = {cm : [], tp : [], ex :[]};
        let acro = this.course.acronym;
        if(this.userS.hasSlot(acro, 'CM')) {
          this.slotCM = this.userS.getSlot(acro, 'CM');
        }
        if(this.userS.hasSlot(acro, 'TP')) {
          this.slotTP = this.userS.getSlot(acro, 'TP');
        }
      }
    });

  }

  /*Display the available sessions for a course*/
  ngOnInit() {
    this.getCourse(this.sessionId, this.course.acronym);
  }

  /*Get sessions of the course to display for the selectionned project and display them*/
  getCourse(sessionId : string, acronym : string){
    this.courseService.getCourseId(sessionId, acronym).then(
      data => {
        let courseId = data;
        this.courseService.getActivity(sessionId, courseId).then(
          data => {
            this.course.activities = data.sort(
              (a1,a2) => a1.start.valueOf() - a2.start.valueOf()
            ).filter(
                activitie => activitie.end.valueOf() > Date.now().valueOf()
              ); // display only activities finished after now time
              this.displayedActi=this.course.activities;
              this.courseSorted.cm = this.course.activities.filter(acti => acti.type === 'Cours magistral');
              this.courseSorted.tp = this.course.activities.filter(acti => (acti.type === 'TD' || acti.type === 'TP'));
              this.courseSorted.ex = this.course.activities.filter(acti => acti.isExam);
              this.updateDisplayed();
          }

        )
      }
    )
  }

  /*Add an activity (a session of the course) to the calendar of the smartphone*/
  addToCalendar(slidingItem : IonItemSliding, activity : Activity){
    let options:any = {
      firstReminderMinutes:15
    };
    let message:string;
    this.translateService.get('COURSE.MESSAGE').subscribe((res:string) => {message=res;});
    this.calendar.createEventWithOptions(this.course.name +" : " + activity.type,
      activity.auditorium, null, activity.start,
      activity.end, options).then(() => {
        let toast = this.toastCtrl.create({
          message: message,
          duration: 3000
        }).then(toast => toast.present());
        slidingItem.close();
    });
      this.utilsServices.alertCourse({'warning': 'COURSE.WARNING', 'message': 'COURSE.MESSAGE3'});
  }

  /*Filter TP if a slot is selectionned*/
  updateDisplayedTP(){
      let toFilter = this.courseSorted.tp;
      if(toFilter.length==0) this.noTP = true;
      else this.noTP = false;
      let toPush;
      if(this.slotTP != "no") toPush = toFilter.filter(acti => ( acti.name === this.slotTP || acti.name.indexOf('-') > -1));
      else toPush = this.courseSorted.tp;
      this.displayedActi = this.displayedActi.concat(toPush);
  }

  /*Filter CM if a slot is selectionned*/
  updateDisplayedCM(){
      let toFilter = this.courseSorted.cm;
  		if(toFilter.length==0) this.noCM = true;
  		else this.noCM = false;
      let toPush:Array<Activity>;
      if(this.slotCM != "no") toPush = toFilter.filter(acti => ( acti.name === this.slotCM));
      else toPush = this.courseSorted.cm;
      this.displayedActi = this.displayedActi.concat(toPush);
  }

  /*Update the display if a filter is applicated*/
  updateDisplayed(){
    this.displayedActi = [];
    this.updateDisplayedCM();
    this.updateDisplayedTP();
    this.displayedActi = this.displayedActi.concat(this.courseSorted.ex);
    if(this.courseSorted.ex.length == 0) this.noEx = true;
    else this.noEx = false;
    console.log(this.displayedActi);
  }

  /*Display a prompt to proprose to the students the slots available for the TP or the CM*/
  showPrompt(segment: string){
    let title:string;
    let message:string;
    let cancel:string;
    let apply:string;
    this.translateService.get('COURSE.TITLE').subscribe((res:string) => {title=res;});
    this.translateService.get('COURSE.MESSAGE2').subscribe((res:string) => {message=res;});
    this.translateService.get('COURSE.CANCEL').subscribe((res:string) => {cancel=res;});
    this.translateService.get('COURSE.APPLY').subscribe((res:string) => {apply=res;});
    var options = {
      title: title,
      message: message,
      inputs : [],
      buttons : [
      {
          text: cancel,
          handler: data => {

          }
      },
      {
          text: apply,
          handler: data => {
            this.addSlot(segment, data);
            this.updateDisplayed();
          }
      }
    ]};
    let aucun = ((this.slotTP === 'no' && segment === 'TD') || (this.slotCM === 'no' && segment === 'Cours magistral'));
    let array = this.getSlots(segment);
    for(let i=0; i< array.length; i++) {
       let slotChosen = (this.slotTP === array[i].name || this.slotCM === array[i].name);
      options.inputs.push({ name : 'options', value: array[i].name , label: array[i].name + " " + array[i].start.getHours()+":"+array[i].start.getUTCMinutes() , type: 'radio', checked: slotChosen });
    }
    if(options.inputs.length > 1) options.inputs.push({name:'options', value:"no", label : "Toutes", type : 'radio', checked: aucun});
    let prompt = this.alertCtrl.create(options);
    if(options.inputs.length > 1)prompt.then(prompt => prompt.present());
  }

  private addSlot(segment: string, data: any) {
    const type = segment === 'Cours magistral' ? 'CM' : 'TP';
    if (type === 'TP') {
      this.slotTP = data;
    } else {
      this.slotCM = data;
    }
    this.userS.addSlot(this.course.acronym, data, type);
  }
  /*Return the different slots available for a course TP or CM */
  getSlots(segment:string){
    let act: Activity[] = this.course.activities;
     act = act.filter(
      acti => (acti.type == segment || (acti.type == "TP" && segment == "TD") || (segment == "Examen" && acti.isExam))
      );
    //retrieve name of each slot
    let slots = act.map(item => item.name)
      .filter((value, index, self) => self.indexOf(value) === index); //keep only different
    //delete some session (like seance aide etude)
    if(segment == "TD") slots = slots.filter(acti => acti.indexOf("_") !== -1);
    if(segment == "Cours magistral") slots = slots.filter(acti => acti.indexOf("-") !== -1);
    let newAct: Activity[] = [];
    //retrieve one activity of each slot
    for(let i=0; i< slots.length; i++){
      let activity:Activity = act.find(acti => acti.name == slots[i]);
      newAct.push(activity);
    }
    return newAct;
  }

  /*Add a course to the calendar*/
  addCourseToCalendar(){
    let options:any = {
      firstReminderMinutes:15
    };
    for (let activity of this.displayedActi) {
      this.calendar.createEventWithOptions(this.course.name +" : " + activity.type,
        activity.auditorium, null, activity.start,activity.end, options);
    }
    let message:string;
    this.translateService.get('STUDY.MESSAGE3').subscribe((res:string) => {message=res;});

    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    }).then(toast => toast.present());
    this.utilsServices.alertCourse({'warning': 'STUDY.WARNING', 'message': 'STUDY.MESSAGE4'});
  }

   openModalInfo(){

    let myModal = this.modalCtrl.create(
      {
        component: ModalInfoPage, 
        componentProps: {course: this.course, year: this.year},
        cssClass: "modal-fullscreen" 
      }).then(modal => modal.present());

   }

     /*Open or close the schedule*/
  toggleGroup(group) {
      if (this.isGroupShown(group)) {
          this.shownGroup = null;
      } else {
          this.shownGroup = group;
      }
  }

  /*The selectionned schedule is displayed?*/
  isGroupShown(group) {
      return this.shownGroup === group;
  }
}
