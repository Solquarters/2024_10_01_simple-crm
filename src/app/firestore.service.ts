// import { Injectable } from '@angular/core';
// import { Firestore, collection, getDocs } from '@angular/fire/firestore';
// import { User } from '../models/user.class';


// @Injectable({
//   providedIn: 'root'
// })
// export class FirestoreService {
  
//   usersArray: User[] = [];
 
//   constructor(private firestore: Firestore) {
//   }

//   initializeUsersArray() {
//     this.turnQuerySnapshotToUserArray();
//   }

// ///Realtime query
// async turnQuerySnapshotToUserArray() {
//   try {
//     const querySnapshot = await getDocs(collection(this.firestore, 'users'));
//     console.log('QuerySnapshot:', querySnapshot);
//     this.usersArray = querySnapshot.docs.map(doc => {
//       const data = doc.data();
//       data['id'] = doc.id; // Add the id to the data object
//       return new User(data); // Create a new User instance
//     });
//   } catch (error) {
//     console.error('Error fetching users:', error);
//   }
// }

// }

import { Injectable } from '@angular/core';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';
import { User } from '../models/user.class';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  usersArray: User[] = [];
  unsubscribe: any;

  constructor(private firestore: Firestore) {
    this.initializeUsersArray();
  }

  initializeUsersArray() {
    const usersCollection = collection(this.firestore, 'users');

    // Set up the real-time listener
    //unsubscribe is inhereting a unsubscribe function to stop the listener
    this.unsubscribe = onSnapshot(usersCollection, (querySnapshot) => {
      console.log('Received real-time update:', querySnapshot);
      console.log('querySnapshot.docs:', querySnapshot.docs);

      this.usersArray = querySnapshot.docs.map(doc => {

        console.log('querySnapshot.docs.map: Single doc.data()', doc.data);
        const data = doc.data();
        data['id'] = doc.id; // Add the id to the data object
        return new User(data); // Create a new User instance
      });
    }, (error) => {
      console.error('Error fetching users:', error);
    });
  }


  //unsubscribe is the function returned by Firestore's onSnapshot method, specific to Firestore's API.
  ngOnDestroy(){
      this.unsubscribe();
  }

}
