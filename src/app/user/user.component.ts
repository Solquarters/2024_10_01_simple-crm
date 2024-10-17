

// @Component({
//   selector: 'app-user',
//   templateUrl: './user.component.html',
//   styleUrl: './user.component.scss'
// })
// export class UserComponent {
//   firestore: Firestore;
//   firestoreService: FirestoreService;

//   constructor(public dialog: MatDialog, firestore: Firestore, firestoreService:FirestoreService) {
//     this.firestore= firestore;
//     this.firestoreService= firestoreService;
//   }

//   openDialog(){
//     this.dialog.open(DialogAddUserComponent);
//   }

//   consoleOutputUsers(){
//     this.firestoreService.getUsersFromFirestore();
//   }
// }

import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';
import { FirestoreService } from '../firestore.service';
import { User } from '../../models/user.class';
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent {

  usersArray: User[] = [];

  constructor(
    public dialog: MatDialog,
    private firestoreService: FirestoreService
  ) {}

  ngOnInit() {
    this.consoleOutputUsers();
  }

  openDialog() {
    this.dialog.open(DialogAddUserComponent);
  }

//   async consoleOutputUsers() {
//     // const users = await this.firestoreService.getUsersFromFirestore();
//     // console.log(users);

//     try {
//       const querySnapshot = await this.firestoreService.getUsersFromFirestore();
//       this.usersArray = querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
//       console.log('Users:', usersArray);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     }

//   }
// }
async consoleOutputUsers() {
  try {
    const querySnapshot = await this.firestoreService.getUsersFromFirestore();
    this.usersArray = querySnapshot.docs.map(doc => {
      let data = doc.data();
      data['id'] = doc.id; // Add the id to the data object
      return new User(data); // Create a new User instance
    });
    console.log('Users:', this.usersArray);
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}
}