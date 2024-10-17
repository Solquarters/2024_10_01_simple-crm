import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  
  // usersArray: User[] = [];
  usersArray: any;
  querySnapshot: any;

  constructor(private firestore: Firestore) {
    this.firestore = firestore;
    this.usersArray = this.getUsersFromFirestore();
  }

async getUsersFromFirestore(){
  // return await getDocs(collection(this.firestore, 'users')); 
  const usersCollection = collection(this.firestore, 'users');

  //Returns a query snapshot
    return getDocs(usersCollection);
}
  
}
