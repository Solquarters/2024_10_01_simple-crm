import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.class';

import { FirestoreService } from '../firestore.service';


import { FormControl, Validators, FormGroup, FormBuilder  } from '@angular/forms';

@Component({
  selector: 'app-dialog-edit-email',
  templateUrl: './dialog-edit-email.component.html',
  styleUrl: './dialog-edit-email.component.scss'
})
export class DialogEditEmailComponent {
  user: User = new User();
  birthDate: Date | undefined;
  // loading = false;

  
  userForm: FormGroup;


  constructor(
    public dialogRef: MatDialogRef<DialogEditEmailComponent>,
    public firestoreService: FirestoreService,
    private fb: FormBuilder,
   
  ){
    this.userForm = this.fb.group({
      firstNameControl: ['', Validators.required, Validators.minLength(3)],
      lastNameControl: ['', Validators.required, Validators.minLength(3)],
      emailControl: ['', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
     
    });
  
  }



  get firstNameControl(): FormControl {
    return this.userForm.get('firstNameControl') as FormControl;
  }
  
  get lastNameControl(): FormControl {
    return this.userForm.get('lastNameControl') as FormControl;
  }
  
  get emailControl(): FormControl {
    return this.userForm.get('emailControl') as FormControl;
  }
  
  cancelDialog(){
    this.dialogRef.close();
  }
  
  // async saveUser(){
  //   this.firestoreService.user = this.user;
  //   if(this.user.id){
  //     await this.firestoreService.updateUser(this.user.id);
  //   }
   
  //   this.dialogRef.close();
   
  // }



  async saveUser() {
    if (this.userForm.valid) {
      // Update the user object with FormControl values
      const formValues = this.userForm.value;
      this.firestoreService.user.firstName = formValues.firstNameControl;
      this.firestoreService.user.lastName = formValues.lastNameControl;
      this.firestoreService.user.email = formValues.emailControl;
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

  
  
  }
  

