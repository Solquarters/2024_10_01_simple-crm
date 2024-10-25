import { Component } from '@angular/core';
import { FirestoreService } from '../firestore.service';
import {MatDialogRef} from '@angular/material/dialog';


@Component({
  selector: 'app-add-licence-dialog',
  templateUrl: './add-licence-dialog.component.html',
  styleUrl: './add-licence-dialog.component.scss'
})
export class AddLicenceDialogComponent {

  licenseName: string = '';
  expirationDate: Date = new Date('');


  constructor(public dialogRef: MatDialogRef<AddLicenceDialogComponent>,
    public firestoreService: FirestoreService  
  ){
  
  }
  

  
cancelLicenseDialog(){
  this.dialogRef.close();
}

submitLicense(){
  
  // Get the license name and expiration date in the desired format
  const licenseKey = this.licenseName;
  const expirationDateValue = this.expirationDate.getTime(); // Convert to timestamp for Firestore

  // Add the license to the Firestore user document
  this.firestoreService.user.licenses = {
    ...this.firestoreService.user.licenses, // Preserve existing licenses
    [licenseKey]: expirationDateValue // Add new license
  }

  this.dialogRef.close();
}

}
