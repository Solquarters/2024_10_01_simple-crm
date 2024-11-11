import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FirestoreService } from '../firestore.service';
import { User } from '../../models/user.class';
import { ChangeDetectorRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent implements OnInit {
  localUsersArray: User[] = [];
  private usersSubscription?: Subscription;
  users$: Observable<User[]>;

constructor(public firestoreService: FirestoreService,private changeDetectorRef: ChangeDetectorRef){

  this.users$ = this.firestoreService.users$;
}

  ngOnInit() {
    this.users$.subscribe((users) => {
      this.localUsersArray = users;
      this.changeDetectorRef.detectChanges();
    });
  }

  ngOnDestroy() {
    // Unsubscribe to avoid memory leaks
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
  }

  countTotalLicenses(){
    let totalLicenses = 0;
    for(let i = 0; i < this.localUsersArray.length-1; i++){
      totalLicenses += this.localUsersArray[i].licenses.length;
    }
    return totalLicenses;
  }


}


