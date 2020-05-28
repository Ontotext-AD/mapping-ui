import {Component, Inject, OnInit} from '@angular/core';
import {TabularDataService} from 'src/app/services/tabular-data.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MappingDefinitionImpl} from 'src/app/models/mapping-definition-impl';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {Source} from 'src/app/models/source';
import {ColumnsService} from 'src/app/services/rest/columns.service';
import {OnDestroyMixin, untilComponentDestroyed} from '@w11k/ngx-componentdestroyed';

export interface RdfDialogData {
  rdf: string;
}

@Component({
  selector: 'app-mapper',
  templateUrl: './mapper.component.html',
  styleUrls: ['./mapper.component.scss'],
})
export class MapperComponent extends OnDestroyMixin implements OnInit {
  sources: Array<Source>;
  mapping: MappingDefinitionImpl;
  rdf: string;

  constructor(private tabularDataService: TabularDataService,
              private modelManagementService: ModelManagementService,
              private columnService: ColumnsService,
              public dialog: MatDialog) {
    super();
  }

  drop() {
    this.openDialog();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(RdfValueDialog, {
      width: '250px',
      data: {name: this.rdf},
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.rdf = result;
    });
  }


  ngOnInit(): void {
    this.columnService.getColumns()
        .pipe(untilComponentDestroyed(this))
        .subscribe(
            (data) => {
              this.sources = data;
            });
    this.mapping = this.modelManagementService.getStoredModelMapping();
  }
}

@Component({
  selector: 'rdf-value-dialog',
  templateUrl: 'rdf-value-dialog.html',
})
export class RdfValueDialog {
  constructor(
    public dialogRef: MatDialogRef<RdfValueDialog>,
    @Inject(MAT_DIALOG_DATA) public rdf: RdfDialogData) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
