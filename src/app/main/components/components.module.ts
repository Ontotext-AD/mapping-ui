import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DialogComponent} from 'src/app/main/components/dialog/dialog.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {TranslateModule} from '@ngx-translate/core';
import {MatDialogModule} from '@angular/material/dialog';
import {FlexModule} from '@angular/flex-layout';
import {MatButtonModule} from '@angular/material/button';


@NgModule({
  declarations: [
    DialogComponent,
  ],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    TranslateModule,
    MatDialogModule,
    FlexModule,
    MatButtonModule,
  ],
  exports: [
    DialogComponent,
  ],
})
export class ComponentsModule { }
