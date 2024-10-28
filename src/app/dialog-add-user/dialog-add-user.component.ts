import { Component } from '@angular/core';
import { User } from '../../models/user.class';
import {MatDialogRef} from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { FirestoreService } from '../firestore.service';
import { AddLicenceDialogComponent } from '../add-licence-dialog/add-licence-dialog.component';
import { Validators, FormControl } from '@angular/forms';



/////BEIM ÖFFNEN VON ADD USER DIALOG NULL INJECTOR ERROR zu NGCONTROL
///AUSSERDEM HABE ICH BISHER IM HTML NUR FIRSTNAME LASTNAME verlinkt mit formControl="firstNameControl" und hier auch ohne eckige klammern [formControl]="firstNameControl"
//da ein fehler ausgelöst wurde mit den klammern ... ic hweiß noch nicht wieso
import { NgControl } from '@angular/forms';

@Component({
  selector: 'app-dialog-add-user',
  templateUrl: './dialog-add-user.component.html',
  styleUrls: ['./dialog-add-user.component.scss']
})

export class DialogAddUserComponent {
  Object = Object;
 
  constructor(public dialogRef: MatDialogRef<DialogAddUserComponent>, 
    public firestoreService: FirestoreService, 
    public dialog: MatDialog
  ) {
    this.firestoreService.user = new User();
    this.firestoreService.birthDate = new Date('')
  }
  
 ////////////////////////////////////////

 firstNameControl = new FormControl('', [Validators.required]);
 lastNameControl = new FormControl('', [Validators.required]);
 emailControl = new FormControl('', [Validators.required, Validators.email]);
 streetControl = new FormControl('', [Validators.required]);
 zipCodeControl = new FormControl( 0 , [Validators.required]);
 cityControl = new FormControl('', [Validators.required]);



 ////////////////////////////////////////
  // onSubmit(ngForm: NgForm){

  // }

  // saveUser(){
  //   this.firestoreService.saveUser(this.dialogRef);
  // }

  saveUser() {
    if(this.firstNameControl.value && 
      this.lastNameControl.value &&
      this.emailControl.value &&
      this.streetControl.value &&
      this.zipCodeControl.value &&
      this.cityControl.value
    
    ){
      if (
        this.firstNameControl.valid &&
        this.lastNameControl.valid &&
        this.emailControl.valid &&
        this.streetControl.valid &&
        this.zipCodeControl.valid &&
        this.cityControl.valid
      ) {
        // Update the user object with FormControl values
        this.firestoreService.user.firstName = this.firstNameControl.value;
        this.firestoreService.user.lastName = this.lastNameControl.value;
        this.firestoreService.user.email = this.emailControl.value;
        this.firestoreService.user.street = this.streetControl.value;
        this.firestoreService.user.zipCode = this.zipCodeControl.value;
        this.firestoreService.user.city = this.cityControl.value;
  
        // Call the saveUser function in the FirestoreService
        this.firestoreService.saveUser(this.dialogRef);
      } else {
        // Handle invalid form (e.g., show an error message)
        console.error('Form is invalid');
      }
    }
    
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
