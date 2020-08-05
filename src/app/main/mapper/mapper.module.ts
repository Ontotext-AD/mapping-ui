import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HeaderComponent} from 'src/app/main/mapper/header/header.component';
import {SourceComponent} from 'src/app/main/mapper/sources/source.component';
import {TranslateModule} from '@ngx-translate/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FlexLayoutModule} from '@angular/flex-layout';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MapperComponent} from 'src/app/main/mapper/mapper.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatChipsModule} from '@angular/material/chips';
import {DirectivesModule} from 'src/app/directives/directives.module';
import {IterationComponent} from 'src/app/main/mapper/iteration/iteration.component';
import {MapperDialogComponent} from './mapper-dialog/mapper-dialog.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatDividerModule} from '@angular/material/divider';
import {CellModule} from 'src/app/main/mapper/cell/cell.module';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {JSONValueDialog} from 'src/app/main/mapper/json-value-dialog';
import {SatPopoverModule} from '@ncstate/sat-popover';
import {MatCardModule} from '@angular/material/card';

@NgModule({
  declarations: [
    MapperComponent,
    HeaderComponent,
    SourceComponent,
    JSONValueDialog,
    IterationComponent,
    MapperDialogComponent,
  ],
  exports: [
    MapperComponent,
    HeaderComponent,
    IterationComponent,
    SourceComponent,
    JSONValueDialog,
  ],
  imports: [
    CommonModule,
    TranslateModule.forRoot(),
    CellModule,

    FlexLayoutModule,
    MatFormFieldModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatChipsModule,
    DirectivesModule,
    MatCheckboxModule,
    MatRadioModule,
    MatAutocompleteModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatDividerModule,
    SatPopoverModule,
    MatCardModule,
  ],
  providers: [ModelManagementService],
})
export class MapperModule { }
