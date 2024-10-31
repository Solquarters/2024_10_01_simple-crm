import { Component } from '@angular/core';
import { User } from '../../models/user.class';
import {MatDialogRef} from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { FirestoreService } from '../firestore.service';
import { AddLicenceDialogComponent } from '../add-licence-dialog/add-licence-dialog.component';
import { Validators, FormControl } from '@angular/forms';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AddLicToEmptyUserComponent } from '../add-lic-to-empty-user/add-lic-to-empty-user.component';


@Component({
  selector: 'app-dialog-add-user',
  templateUrl: './dialog-add-user.component.html',
  styleUrls: ['./dialog-add-user.component.scss']
})

export class DialogAddUserComponent {
  Object = Object;
  userForm: FormGroup;
 
  constructor(public dialogRef: MatDialogRef<DialogAddUserComponent>, 
    public firestoreService: FirestoreService, 
    public dialog: MatDialog,
    private fb: FormBuilder,
  ) {
    this.firestoreService.user = new User();
    this.firestoreService.birthDate = new Date('');

    this.userForm = this.fb.group({
      firstNameControl: [{ value: '', disabled: this.firestoreService.loading}, [Validators.required, Validators.minLength(3)]],
      lastNameControl: [{ value: '', disabled: this.firestoreService.loading }, [Validators.required, Validators.minLength(3)]],
      emailControl: [{ value: '', disabled: this.firestoreService.loading }, [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      streetControl: [{ value: '', disabled: this.firestoreService.loading }, [Validators.required, Validators.minLength(3)]],
      zipCodeControl: [{ value: '', disabled: this.firestoreService.loading }, [Validators.required, Validators.pattern('^\\d{3,}$')]],
      cityControl: [{ value: '', disabled: this.firestoreService.loading }, [Validators.required, Validators.minLength(3)]],
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

get streetControl(): FormControl {
  return this.userForm.get('streetControl') as FormControl;
}

get zipCodeControl(): FormControl {
  return this.userForm.get('zipCodeControl') as FormControl;
}

get cityControl(): FormControl {
  return this.userForm.get('cityControl') as FormControl;
}

  // saveUser(){
  //   this.firestoreService.saveUser(this.dialogRef);
  // }
  saveUser() {
    if (this.userForm.valid) {
      // Update the user object with FormControl values
      const formValues = this.userForm.value;
      this.firestoreService.user.firstName = formValues.firstNameControl;
      this.firestoreService.user.lastName = formValues.lastNameControl;
      this.firestoreService.user.email = formValues.emailControl;
      this.firestoreService.user.street = formValues.streetControl;
      this.firestoreService.user.zipCode = formValues.zipCodeControl;
      this.firestoreService.user.city = formValues.cityControl;

      // Call the saveUser function in the FirestoreService
      this.firestoreService.saveUser(this.dialogRef);
    } else {
      // Mark all controls as touched to trigger validation messages
      this.userForm.markAllAsTouched();
      console.error('Form is invalid');
    }
  }
 
  cancelDialog(){
    this.dialogRef.close();
  }

  openLicenceDialog(){
    this.dialog.open(AddLicToEmptyUserComponent);
  }


  deleteSingleLicense(licenseIdInput: string) {
    this.firestoreService.user.licenses = this.firestoreService.user.licenses.filter(license => license.licenseId !== licenseIdInput);
  }
}
