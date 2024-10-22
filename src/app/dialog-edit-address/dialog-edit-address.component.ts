// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-dialog-edit-address',
//   templateUrl: './dialog-edit-address.component.html',
//   styleUrl: './dialog-edit-address.component.scss'
// })
// export class DialogEditAddressComponent {

// }


import { Component } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.class';

import { FirestoreService } from '../firestore.service';

@Component({
  selector: 'app-dialog-edit-address',
  templateUrl: './dialog-edit-address.component.html',
  styleUrl: './dialog-edit-address.component.scss'
})
export class DialogEditAddressComponent {

user: User = new User();
// loading = false;

constructor(
  public dialogRef: MatDialogRef<DialogEditAddressComponent>,
  public firestoreService: FirestoreService  
){

}





cancelDialog(){
  this.dialogRef.close();
}

saveUser(){
  this.firestoreService.user = this.user;
  this.firestoreService.saveUser(this.dialogRef);
}

}
