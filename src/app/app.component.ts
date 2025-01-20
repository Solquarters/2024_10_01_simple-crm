import { Component, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { InfoDialogComponent } from './info-dialog/info-dialog.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'simple-crm';

  firestore: Firestore = inject(Firestore);
  items$: Observable<any[]>;

  constructor(public dialog: MatDialog,) {
    const aCollection = collection(this.firestore, 'items')
    this.items$ = collectionData(aCollection);
  }












  openInfoDialog() {
    const dialogRef = this.dialog.open(InfoDialogComponent, {
      autoFocus: false,
      ariaDescribedBy: null,
      ariaLabelledBy: null
    });
  }
}
