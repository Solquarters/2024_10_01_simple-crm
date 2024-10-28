import { Component } from '@angular/core';
import { User } from '../../models/user.class';
import {MatDialogRef} from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { FirestoreService } from '../firestore.service';
import { AddLicenceDialogComponent } from '../add-licence-dialog/add-licence-dialog.component';

@Component({
  selector: 'app-dialog-add-user',
  templateUrl: './dialog-add-user.component.html',
  styleUrls: ['./dialog-add-user.component.scss']
})

export class DialogAddUserComponent {
  Object = Object;
 
  constructor(public dialogRef: MatDialogRef<DialogAddUserComponent>, public firestoreService: FirestoreService, public dialog: MatDialog) {
    this.firestoreService.user = new User();
    this.firestoreService.birthDate = new Date('');
  }
  
  // onSubmit(ngForm: NgForm){

  // }

  saveUser(){
    this.firestoreService.saveUser(this.dialogRef);
  }

  cancelDialog(){
    this.dialogRef.close();
  }

  openLicenceDialog(){
    this.dialog.open(AddLicenceDialogComponent);
  }


  deleteSingleLicense(licenseIdInput: string) {
    this.firestoreService.user.licenses = this.firestoreService.user.licenses.filter(license => license.licenseId !== licenseIdInput);
  }
}
