



import { Component, Input, Inject } from '@angular/core';
import { FirestoreService } from '../firestore.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { FormControl, Validators, FormGroup, FormBuilder  } from '@angular/forms';

@Component({
  selector: 'app-add-lic-to-empty-user',
  templateUrl: './add-lic-to-empty-user.component.html',
  styleUrl: './add-lic-to-empty-user.component.scss'
})

export class AddLicToEmptyUserComponent {
  licenseName: string = '';
  expirationDate: Date = new Date('');
  licenseForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddLicToEmptyUserComponent>,
    public firestoreService: FirestoreService,
   
    private fb: FormBuilder, 
  ){
    this.licenseForm = this.fb.group({
      licenseNameControl: ['', [Validators.required, Validators.minLength(3)]],
      expirationDateControl: ['', [Validators.required, this.dateInFutureValidator()] ],
     
    });
  }

  get licenseNameControl(): FormControl {
    return this.licenseForm.get('licenseNameControl') as FormControl;
  }
  
  get expirationDateControl(): FormControl {
    return this.licenseForm.get('expirationDateControl') as FormControl;
  }

  dateInFutureValidator() {
    return (control: FormControl) => {
      const inputDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);  // Ignore time portion for accuracy
  
      return inputDate >= today ? null : { dateInPast: true };
    };
  }
  
cancelLicenseDialog(){
  this.dialogRef.close();
}


submitLicense() {
  if(this.licenseForm.valid){
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
     this.dialogRef.close();

    // Call the saveUser function in the FirestoreService
    // this.firestoreService.saveUser(this.dialogRef);

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
