import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CellComponent} from 'src/app/main/mapper/cell/cell.component';
import {TranslateModule} from '@ngx-translate/core';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatTooltipModule} from '@angular/material/tooltip';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {DirectivesModule} from 'src/app/directives/directives.module';
import {MatIconModule} from '@angular/material/icon';
import {PreviewCellComponent} from './preview-cell/preview-cell.component';
import {ConfigurationCellComponent} from './configuration-cell/configuration-cell.component';
import {ConfigurationAndPreviewCellComponent} from './configuration-and-preview-cell/configuration-and-preview-cell.component';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {MatDividerModule} from '@angular/material/divider';


@NgModule({
  declarations: [
    CellComponent,
    PreviewCellComponent,
    ConfigurationCellComponent,
    ConfigurationAndPreviewCellComponent,
  ],
  exports: [
    CellComponent,
    PreviewCellComponent,
    ConfigurationCellComponent,
    ConfigurationAndPreviewCellComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule.forRoot(),

    FlexLayoutModule,
    MatFormFieldModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    DirectivesModule,
    MatAutocompleteModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  providers: [ModelManagementService],
})
export class CellModule { }
