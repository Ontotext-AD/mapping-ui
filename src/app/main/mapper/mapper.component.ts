import {Component, Inject, OnInit} from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {TabularDataService} from "src/app/services/tabular-data.service";
import {ColumnsService} from "src/app/services/rest/columns.service";
import { Convert, MappingDefinition } from "src/app/models/mapping-definition";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import amsterdamMapping from "src/app/models/amsterdam-mapping.json";
import {Source} from "src/app/models/source";


export interface RdfDialogData {
  rdf: string;
}

@Component({
  selector: 'app-mapper',
  templateUrl: './mapper.component.html',
  styleUrls: ['./mapper.component.scss']
})
export class MapperComponent implements OnInit {

  sources: Array<Source>;
  mapping: MappingDefinition;
  rdf: string;

  constructor(private columnService: ColumnsService,
              public dialog: MatDialog) {
  }

  drop(event: CdkDragDrop<any[]>) {
    this.openDialog();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(RdfValueDialog, {
      width: '250px',
      data: {name: this.rdf}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.rdf = result;
    });
  }


  ngOnInit(): void {
    debugger;
    this.columnService.getColumns().subscribe((data) => this.sources = data);
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
