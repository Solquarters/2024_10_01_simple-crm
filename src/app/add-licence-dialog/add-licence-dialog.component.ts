import { Component, Input, Inject } from '@angular/core';
import { FirestoreService } from '../firestore.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';



@Component({
  selector: 'app-add-licence-dialog',
  templateUrl: './add-licence-dialog.component.html',
  styleUrl: './add-licence-dialog.component.scss'
})
export class AddLicenceDialogComponent {

  licenseName: string = '';
  expirationDate: Date = new Date('');

  constructor(
    public dialogRef: MatDialogRef<AddLicenceDialogComponent>,
    public firestoreService: FirestoreService,
    @Inject(MAT_DIALOG_DATA) public data: { userIdDataInput: string } 
  ){
  
  }

  @Input() userIdDataInput!: string;
  
cancelLicenseDialog(){
  this.dialogRef.close();
}


submitLicense(parentUserId: string) {
  // Get the license name and expiration date in the desired format
  const licenseName = this.licenseName;
  const expirationDateValue = this.expirationDate.getTime(); // Convert to timestamp for Firestore
  const licenseId = this.generateBase64Sequence(length = 16);

  // Create the new license object
  const newLicense = { licenseName: licenseName, value: expirationDateValue, licenseId: licenseId};

  // Add the new license to the licenses array
  this.firestoreService.user.licenses.push(newLicense);

  // console.log('Firestore user id:', this.firestoreService.user.id);
  // console.log('This user ID:', parentUserId);
  // console.log('data.userIdDataInput:', this.data.userIdDataInput);

  if(parentUserId){
    this.firestoreService.updateUser(parentUserId);
  }
  

  // Close the dialog
  this.dialogRef.close();
}



generateBase64Sequence(length = 16) {
  const randomBytes = new Uint8Array(Math.ceil((length * 6) / 8)); // Calculate bytes needed
  crypto.getRandomValues(randomBytes); // Fill with random values

  // Encode to base-64 and truncate to desired length
  return btoa(String.fromCharCode(...randomBytes)).substring(0, length);
}

}
