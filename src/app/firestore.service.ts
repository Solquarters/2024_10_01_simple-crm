import { Injectable } from '@angular/core';
import { Firestore, collection, onSnapshot, addDoc, doc, docData, deleteDoc } from '@angular/fire/firestore';
import { User } from '../models/user.class';
import { updateDoc } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();
  unsubscribe: any;
  loading = false;
  user: User = new User();
  birthDate: Date | undefined;

  constructor(public firestore: Firestore) {
    this.initializeUsersArray();
    
  }

  saveUser(dialogRefInput: any) {
    if (this.birthDate) {
      this.user.birthDate = this.birthDate.getTime();
    }
    this.loading = true;
    const userRef = collection(this.firestore, 'users');
    addDoc(userRef, this.user.toJSON())
      .then((result: any) => {
        this.loading = false;
        dialogRefInput.close();
      })
      .catch((error) => {
        console.error('Error adding user to Firestore', error);
      });
  }

  async updateUser(userIdInput: string) {
    this.loading = true;
    const docRef = doc(this.firestore, 'users', userIdInput);
    await updateDoc(docRef, this.user.toJSON())
      .then((result: any) => {
        this.loading = false;
      })
      .catch((error) => {
        console.error('Error updating user to Firestore', error);
      });
  }

  getSingleUser(idInput: string) {
    const userDocRef = doc(this.firestore, `users/${idInput}`);
    docData(userDocRef).subscribe((user: any) => {
      this.user = new User(user);
    });
  }

  initializeUsersArray() {
    const usersCollection = collection(this.firestore, 'users');

    this.unsubscribe = onSnapshot(usersCollection, (querySnapshot) => {
      const usersArray = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        data['id'] = doc.id; // Add the id to the data object
        return new User(data);
      });

      this.usersSubject.next(usersArray); // Emit the new user data
    }, (error) => {
      console.error('Error fetching users:', error);
    });
  }


  async deleteSingleUser(userIdInput: string): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, 'users', userIdInput);
      await deleteDoc(userDocRef);
      console.log(`User with ID ${userIdInput} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }







  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }





}


// import { Injectable } from '@angular/core';
// import { Firestore, collection, onSnapshot, addDoc, doc, docData } from '@angular/fire/firestore';
// import { User } from '../models/user.class';
// import { updateDoc } from 'firebase/firestore';

// @Injectable({
//   providedIn: 'root'
// })
// export class FirestoreService {

// ////////////////////

// loading = false;
// user: User = new User();
// birthDate: Date | undefined;


// ///////////////////////

//   usersArray: User[] = [];
//   unsubscribe: any;

//   constructor(private firestore: Firestore) {
//     this.initializeUsersArray();
//   }


// saveUser(dialogRefInput:any) {
//   if (this.birthDate) {
//     this.user.birthDate = this.birthDate.getTime();
//   }
//   this.loading = true;
//   const userRef = collection(this.firestore, 'users');
//   addDoc(userRef, this.user.toJSON())
//     .then((result: any) => {
//       // console.log('Added user to Firestore', result);
//       this.loading = false;
//       // this.dialogRef.close();
//       dialogRefInput.close();
//     })
//     .catch((error) => {
//       console.error('Error adding user to Firestore', error);
//     });
// }

// async updateUser(userIdInput: string){
//   this.loading = true;
//   const docRef = doc(this.firestore, 'users', userIdInput);
//   await updateDoc(docRef, this.user.toJSON())
//   .then((result: any) => {
//     // console.log('Updated user, result:', result);
//     this.loading = false;
  
//   })
//   .catch((error) => {
//     console.error('Error updating user to Firestore', error);
//   });
// }


// getSingleUser(idInput: string) {
//   const userDocRef = doc(this.firestore, `users/${idInput}`);
//   docData(userDocRef).subscribe((user: any) => {
//     this.user = new User(user);
//     // console.log('got user:', this.user);
//   });
// }



//   initializeUsersArray(onComplete?: () => void) {
//     const usersCollection = collection(this.firestore, 'users');
//     // Set up the real-time listener
//     //unsubscribe is inhereting a unsubscribe function to stop the listener
//     this.unsubscribe = onSnapshot(usersCollection, (querySnapshot) => {
//       // console.log('Received real-time update:', querySnapshot);
//       // console.log('querySnapshot.docs:', querySnapshot.docs);

//       this.usersArray = querySnapshot.docs.map(doc => {

//         // console.log('querySnapshot.docs.map: Single doc.data()', doc.data);
//         const data = doc.data();
//         data['id'] = doc.id; // Add the id to the data object
//         return new User(data); // Create a new User instance
//       });
//     }, (error) => {
//       console.error('Error fetching users:', error);
//     });
//   }

 
//   //unsubscribe is the function returned by Firestore's onSnapshot method, specific to Firestore's API.
//   ngOnDestroy(){
//       this.unsubscribe();
//   }

// }
