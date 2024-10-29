
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.class';
import { FirestoreService } from '../firestore.service';

import { FormControl, Validators, FormGroup, FormBuilder  } from '@angular/forms';

@Component({
  selector: 'app-dialog-edit-address',
  templateUrl: './dialog-edit-address.component.html',
  styleUrl: './dialog-edit-address.component.scss'
})
export class DialogEditAddressComponent {

user: User = new User();
// loading = false;
userForm: FormGroup;


constructor(
  public dialogRef: MatDialogRef<DialogEditAddressComponent>,
  public firestoreService: FirestoreService ,
  private fb: FormBuilder,
){


  this.userForm = this.fb.group({
    streetControl: ['', Validators.required],
    zipCodeControl: ['', Validators.required],
    cityControl: ['', Validators.required],
  });
}


get streetControl(): FormControl {
  return this.userForm.get('streetControl') as FormControl;
}

get zipCodeControl(): FormControl {
  return this.userForm.get('zipCodeControl') as FormControl;
}

get cityControl(): FormControl {
  return this.userForm.get('cityControl') as FormControl;
}

cancelDialog(){
  this.dialogRef.close();
}

async saveUser() {
  if (this.userForm.valid) {
    // Update the user object with FormControl values
    const formValues = this.userForm.value;
    this.firestoreService.user.street = formValues.streetControl;
    this.firestoreService.user.zipCode = formValues.zipCodeControl;
    this.firestoreService.user.city = formValues.cityControl;
    if(this.user.id){
      await this.firestoreService.updateUser(this.user.id);
    }
    this.dialogRef.close();
  } else {
    // Mark all controls as touched to trigger validation messages
    this.userForm.markAllAsTouched();
    console.error('Form is invalid');
  }
}



// async saveUser(){
//   this.firestoreService.user = this.user;

//   if(this.user.id){
//     await this.firestoreService.updateUser(this.user.id );
//   }
//   this.dialogRef.close();
// }

}
