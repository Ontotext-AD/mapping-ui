import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {Convert} from 'src/app/models/mapping-definition';
import {JSONDialogData} from 'src/app/main/mapper/iteration/iteration.component';

@Component({
  selector: 'json-mapping-dialog',
  templateUrl: 'json-mapping-dialog.html',
})
export class JSONValueDialog {
  constructor(
    public dialogRef: MatDialogRef<JSONValueDialog>,
    @Inject(MAT_DIALOG_DATA) public data: JSONDialogData,
    private modelManagementService: ModelManagementService) {
  }

  public passTest() {
    this.modelManagementService.removePreview(this.data.mapping);
    return Convert.mappingDefinitionToJson(this.data.mapping);
  }
}
