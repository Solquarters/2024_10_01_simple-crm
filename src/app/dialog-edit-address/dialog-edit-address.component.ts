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

@Component({
  selector: 'app-dialog-edit-address',
  templateUrl: './dialog-edit-address.component.html',
  styleUrl: './dialog-edit-address.component.scss'
})
export class DialogEditAddressComponent {

constructor(public dialogRef: MatDialogRef<DialogEditAddressComponent>){

}

loading = false;



cancelDialog(){
  this.dialogRef.close();
}

saveUser(){
  
}

}
