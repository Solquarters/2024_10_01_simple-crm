
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
import { Firestore, doc} from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../models/user.class';
import { docData } from '@angular/fire/firestore'; // Import docData for fetching document data
import { MatDialog } from '@angular/material/dialog';
import { DialogEditEmailComponent } from '../dialog-edit-email/dialog-edit-email.component';
import { DialogEditAddressComponent } from '../dialog-edit-address/dialog-edit-address.component';


@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent implements OnInit{

  user: User = new User();
  userId: string | null = '';

  constructor(
    private route: ActivatedRoute, 
    private firestore: Firestore,
    public dialog: MatDialog,
  ) {}

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


  openAddressDialog(){
    ///Make the child dialog editAddress access the parent variable user: 
    const editAddressDialog = this.dialog.open(DialogEditAddressComponent);

    ///Pass on user Object to child dialog or component instance
    editAddressDialog.componentInstance.user = this.user;
    
  };

  openEmailDialog(){
    // this.dialog.open(DialogEditEmailComponent);


        ///Make the child dialog editAddress access the parent variable user: 
        const editEmailDialog = this.dialog.open(DialogEditEmailComponent);

        ///Pass on user Object to child dialog or component instance
        editEmailDialog.componentInstance.user = this.user;
  };
}
