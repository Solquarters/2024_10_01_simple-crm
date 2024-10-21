
// import { Component, OnInit } from '@angular/core';
// import { Firestore, collection, doc} from '@angular/fire/firestore';
// import { ActivatedRoute } from '@angular/router';
// import { User } from '../../models/user.class';

// import { docData } from '@angular/fire/firestore'; 



// @Component({
//   selector: 'app-user-detail',
//   templateUrl: './user-detail.component.html',
//   styleUrl: './user-detail.component.scss'
// })
// export class UserDetailComponent implements OnInit{

//   user: User = new User();

//   userId: string | null = '';
// constructor(private route: ActivatedRoute, private firestore: Firestore ){

// }

//   ngOnInit(): void{
//     this.route.paramMap.subscribe( paramMap => {
//       this.userId = paramMap.get('id');
//       console.log('got id', this.userId);
//     })

//   }


//   getSingleUser(idInput: string){
//     this.firestore
//     .collection('users')
//     .doc(idInput)
//     .valueChanges()
//     .subscribe((user: any) => {
//       this.user = new User(user);
//       console.log('got user:', this.user)
//     });
//   }

// }

import { Component, OnInit } from '@angular/core';
import { Firestore, doc, collection } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../models/user.class';
import { docData } from '@angular/fire/firestore'; // Import docData for fetching document data

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent implements OnInit{

  user: User = new User();
  userId: string | null = '';

  constructor(private route: ActivatedRoute, private firestore: Firestore) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      this.userId = paramMap.get('id');
      console.log('got id', this.userId);
      if (this.userId) {
        this.getSingleUser(this.userId);
      }
    });
  }

  getSingleUser(idInput: string) {
    const userDocRef = doc(this.firestore, `users/${idInput}`);
    docData(userDocRef).subscribe((user: any) => {
      this.user = new User(user);
      console.log('got user:', this.user);
    });
  }
}
