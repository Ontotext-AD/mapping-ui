import {Component, Inject, OnInit} from '@angular/core';
import {TabularDataService} from 'src/app/services/tabular-data.service';
import {MappingDefinition} from 'src/app/models/mapping-definition';
import {MappingSubject} from 'src/app/models/mapping-subject';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

export interface RdfDialogData {
  rdf: string;
}

@Component({
  selector: 'app-mapper',
  templateUrl: './mapper.component.html',
  styleUrls: ['./mapper.component.scss'],
})
export class MapperComponent implements OnInit {
  sources: [];
  mappings = new Array<MappingDefinition>();
  rdf: string;

  constructor(private tabularDataService: TabularDataService,
              public dialog: MatDialog) {
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
    this.sources = this.tabularDataService.getData();
    this.mapping = Convert.toMappingDefinition(JSON.stringify(amsterdamMapping));
    console.log(this.mapping);
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
