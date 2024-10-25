// import { Component } from '@angular/core';
// import { Firestore, collection, addDoc } from '@angular/fire/firestore';
// import { User } from '../../models/user.class';
// import {MatDialogRef} from '@angular/material/dialog';

// @Component({
//   selector: 'app-dialog-add-user',
//   templateUrl: './dialog-add-user.component.html',
//   styleUrls: ['./dialog-add-user.component.scss']
// })

// export class DialogAddUserComponent {
//   firestore: Firestore;

//   loading = false;

//   user: User = new User();
//   birthDate: Date | undefined;

//   constructor(firestore: Firestore, public dialogRef: MatDialogRef<DialogAddUserComponent>) {
//     this.firestore = firestore;
//   }

//   saveUser() {
//     if (this.birthDate) {
//       this.user.birthDate = this.birthDate.getTime();
//     }
//     this.loading = true;
//     const userRef = collection(this.firestore, 'users');
//     addDoc(userRef, this.user.toJSON())
//       .then((result: any) => {
//         console.log('Added user to Firestore', result);
//         this.loading = false;
//         this.dialogRef.close();
//       })
//       .catch((error) => {
//         console.error('Error adding user to Firestore', error);
//       });
//   }

//   cancelDialog(){
//     this.dialogRef.close();
//   }
// }


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
  // firestore: Firestore;

  // loading = false;

  // user: User = new User();
  // birthDate: Date | undefined;

  //cinstructo input firestore: Firestore,
  constructor(public dialogRef: MatDialogRef<DialogAddUserComponent>, public firestoreService: FirestoreService, public dialog: MatDialog,) {
    // this.firestore = firestore;
    this.firestoreService.user = new User();
    this.firestoreService.birthDate = new Date('');
    
  }
  
  // saveUser() {
  //   if (this.birthDate) {
  //     this.user.birthDate = this.birthDate.getTime();
  //   }
  //   this.loading = true;
  //   const userRef = collection(this.firestore, 'users');
  //   addDoc(userRef, this.user.toJSON())
  //     .then((result: any) => {
  //       console.log('Added user to Firestore', result);
  //       this.loading = false;
  //       this.dialogRef.close();
  //     })
  //     .catch((error) => {
  //       console.error('Error adding user to Firestore', error);
  //     });
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



  getLicensesArray() {
    // Convert licenses object into an array of objects with 'name' and 'expiration' properties
    return Object.entries(this.firestoreService.user.licenses || {}).map(([name, expiration]) => ({
      name: name,
      expiration: new Date(expiration) // Convert timestamp to Date object for proper formatting
    }));
  }

  deleteSingleLicense(licenseName: string){
    delete this.firestoreService.user.licenses[licenseName];
  }
}
