import { Component, Input, Inject } from '@angular/core';
import { FirestoreService } from '../firestore.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

import { FormControl, Validators, FormGroup, FormBuilder  } from '@angular/forms';

@Component({
  selector: 'app-add-licence-dialog',
  templateUrl: './add-licence-dialog.component.html',
  styleUrl: './add-licence-dialog.component.scss'
})
export class AddLicenceDialogComponent {

  licenseName: string = '';
  expirationDate: Date = new Date('');

  licenseForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddLicenceDialogComponent>,
    public firestoreService: FirestoreService,
    @Inject(MAT_DIALOG_DATA) public data: { userIdDataInput: string },
    private fb: FormBuilder, 
  ){
    this.licenseForm = this.fb.group({
      licenseNameControl: ['', Validators.required, Validators.minLength(3)],
      expirationDateControl: ['', Validators.required],
     
    });
  }




  @Input() userIdDataInput!: string;


  get licenseNameControl(): FormControl {
    return this.licenseForm.get('licenseNameControl') as FormControl;
  }
  
  get expirationDateControl(): FormControl {
    return this.licenseForm.get('expirationDateControl') as FormControl;
  }
  
cancelLicenseDialog(){
  this.dialogRef.close();
}


submitLicense(parentUserId: string) {

  if (this.licenseForm.valid && parentUserId) {
    // Update the user object with FormControl values
    const formValues = this.licenseForm.value;
   
  // Get the license name and expiration date in the desired format
  const licenseName = formValues.licenseNameControl;
  const expirationDateValue = formValues.expirationDateControl.getTime(); // Convert to timestamp for Firestore
  const licenseId = this.generateBase64Sequence(length = 16);

 // Create the new license object
 const newLicense = { licenseName: licenseName, value: expirationDateValue, licenseId: licenseId};
  // Add the new license to the licenses array
  this.firestoreService.user.licenses.push(newLicense);

  if(parentUserId){
    this.firestoreService.updateUser(parentUserId);
  }
  
  // Close the dialog
  this.dialogRef.close();
    // if(this.user.id){
    //   await this.firestoreService.updateUser(this.user.id);
    // }
    // this.dialogRef.close();
  }else if(this.licenseForm.valid && !parentUserId){
     // Update the user object with FormControl values
     const formValues = this.licenseForm.value;
   
     // Get the license name and expiration date in the desired format
     const licenseName = formValues.licenseName;
     const expirationDateValue = formValues.expirationDate.getTime(); // Convert to timestamp for Firestore
     const licenseId = this.generateBase64Sequence(length = 16);
   
    // Create the new license object
    const newLicense = { licenseName: licenseName, value: expirationDateValue, licenseId: licenseId};
     // Add the new license to the licenses array
     this.firestoreService.user.licenses.push(newLicense);
   

    // Call the saveUser function in the FirestoreService
    this.firestoreService.saveUser(this.dialogRef);

  }
  else {
    // Mark all controls as touched to trigger validation messages
    this.licenseForm.markAllAsTouched();
    console.error('Form is invalid');
  }

}


generateBase64Sequence(length = 16) {
  const randomBytes = new Uint8Array(Math.ceil((length * 6) / 8)); // Calculate bytes needed
  crypto.getRandomValues(randomBytes); // Fill with random values

  // Encode to base-64 and truncate to desired length
  return btoa(String.fromCharCode(...randomBytes)).substring(0, length);
}

}
