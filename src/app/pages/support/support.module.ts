import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { SupportPage } from './support';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  declarations: [SupportPage],
  imports: [
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
  	CommonModule,
    TranslateModule.forChild(),
    RouterModule.forChild([
      {
        path: '',
        component: SupportPage
      }
    ])
  ]
})
export class SupportPageModule { }