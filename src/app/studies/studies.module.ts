import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { ModalProjectPageModule } from './pages/modal-project/modal-project.module';
import { StudiesPage } from './pages/studies';
import { StudentService } from 'src/app/services/wso2-services/student-service';
import { StudiesService } from 'src/app/services/studies-services/studies-service';
import { ConnectivityService } from 'src/app/services/utils-services/connectivity-service';
import { TransService } from 'src/app/services/utils-services/trans-services';

@NgModule({
  declarations: [StudiesPage],
  imports: [
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ModalProjectPageModule,
    TranslateModule.forChild(),
    RouterModule.forChild([
      {
        path: '',
        component: StudiesPage
      }
    ])
  ],
  providers: [
    StudentService,
    StudiesService,
    ConnectivityService,
    TransService,
  ]
})
export class StudiesPageModule { }