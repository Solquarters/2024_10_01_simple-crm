import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { User } from '../models/user.class';


@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  
  usersArray: User[] = [];
 
  constructor(private firestore: Firestore) {
  }

  initializeUsersArray() {
    this.turnQuerySnapshotToUserArray();
  }

///Realtime query
async turnQuerySnapshotToUserArray() {
  try {
    const querySnapshot = await getDocs(collection(this.firestore, 'users'));
    console.log('QuerySnapshot:', querySnapshot);

    this.usersArray = querySnapshot.docs.map(doc => {
      const data = doc.data();
      data['id'] = doc.id; // Add the id to the data object
      return new User(data); // Create a new User instance
    });
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

}
