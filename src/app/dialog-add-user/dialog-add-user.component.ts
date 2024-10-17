// import { Component } from '@angular/core';
// import { User } from '../../models/user.class';

// import { User } from '../../models/user.class';
// import { Component, inject } from '@angular/core';
// import { Firestore, collection, collectionData } from '@angular/fire/firestore';
// import { Observable } from 'rxjs';



// @Component({
//   selector: 'app-dialog-add-user',
//   templateUrl: './dialog-add-user.component.html',
//   styleUrl: './dialog-add-user.component.scss'
// })
// export class DialogAddUserComponent {

//   user: User = new User();

//   birthDate: Date | undefined;

//   saveUser(){
//     if(this.birthDate){
//       this.user.birthDate = this.birthDate.getTime();
//     }
//     console.log(this.user);

//   }
// }

// @Component({
//   selector: 'app-dialog-add-user',
//   templateUrl: './dialog-add-user.component.html',
//   styleUrl: './dialog-add-user.component.scss'
// })
// export class DialogAddUserComponent {
//   firestore: Firestore = inject(Firestore);
//   items$: Observable<any[]>;


//   user: User = new User();
//   birthDate: Date | undefined;
  
//   constructor() {
//     const aCollection = collection(this.firestore, 'items');
//     this.items$ = collectionData(aCollection);
//   }

 

//   saveUser(){
//     if(this.birthDate){
//       this.user.birthDate = this.birthDate.getTime();
//     }
//     // console.log(this.user);

   

//     this.firestore.collection('items').add(this.user.toJSON()).then(result: any) =>{
//       console.log('Added user to firestore', result)
//     }
//   }
// }
import { Component } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { User } from '../../models/user.class';

import {Inject} from '@angular/core';


import {MatDialogRef} from '@angular/material/dialog';



@Component({
  selector: 'app-dialog-add-user',
  templateUrl: './dialog-add-user.component.html',
  styleUrls: ['./dialog-add-user.component.scss']
})
export class DialogAddUserComponent {
  firestore: Firestore;

  loading = false;

  user: User = new User();
  birthDate: Date | undefined;

  constructor(firestore: Firestore, public dialogRef: MatDialogRef<DialogAddUserComponent>) {
    this.firestore = firestore;
  }
  saveUser() {
    if (this.birthDate) {
      this.user.birthDate = this.birthDate.getTime();
    }
    this.loading = true;
    const userRef = collection(this.firestore, 'users');
    addDoc(userRef, this.user.toJSON())
      .then((result: any) => {
        console.log('Added user to Firestore', result);
        this.loading = false;
        this.dialogRef.close();
      })
      .catch((error) => {
        console.error('Error adding user to Firestore', error);
      });
  }
}
