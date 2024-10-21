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

@Component({
  selector: 'app-dialog-edit-address',
  templateUrl: './dialog-edit-address.component.html',
  styleUrl: './dialog-edit-address.component.scss'
})
export class DialogEditAddressComponent {

user: User = new User();

constructor(public dialogRef: MatDialogRef<DialogEditAddressComponent>){

}

loading = false;



cancelDialog(){
  this.dialogRef.close();
}

saveUser(){
  
}

}
