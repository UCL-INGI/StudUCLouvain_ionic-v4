import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { NewsPage } from './news';

@NgModule({
  declarations: [NewsPage],
  imports: [
    IonicModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    TranslateModule.forChild(),
    RouterModule.forChild([
      {
        path: '',
        component: NewsPage
      }
    ])
  ]
})
export class NewsPageModule { }