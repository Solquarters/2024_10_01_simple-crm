import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FirestoreService } from '../firestore.service';
import { User } from '../../models/user.class';
import { ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class UserComponent implements OnInit {
  Object = Object;
  localUsersArray: User[] = [];
  users$: Observable<User[]>;
  randomUsers: User[] = [];

  currentSortKey: keyof User | null = null;
  currentSortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    public dialog: MatDialog,
    public firestoreService: FirestoreService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.users$ = this.firestoreService.users$;
  }

  ngOnInit() {
    this.users$.subscribe((users) => {
      this.localUsersArray = users;
      this.changeDetectorRef.detectChanges();
    });
  }

  openDialog() {
    this.dialog.open(DialogAddUserComponent);
  }



  sortUserArrayByKey(keyInput: keyof User) {
    if (this.currentSortKey === keyInput) {
      this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortKey = keyInput;
      this.currentSortDirection = 'asc';
    }
  
    const sortedArray = [...this.localUsersArray].sort((a, b) => {
      let valueA: any = a[keyInput];
      let valueB: any = b[keyInput];
  
      // Handle the 'licenses' key separately
      if (keyInput === 'licenses') {
        valueA = a.licenses ? a.licenses.length : 0;
        valueB = b.licenses ? b.licenses.length : 0;
      }
  
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.currentSortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
  
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return this.currentSortDirection === 'asc'
          ? valueA - valueB
          : valueB - valueA;
      }
  
      return 0;
    });
  
    this.localUsersArray = sortedArray;
    this.changeDetectorRef.detectChanges();
  }
  

  
consoleOutputUsers() {
  this.createRandomUsers();
  this.saveRandomUsers();
  console.log(this.firestoreService.users$);
}

createRandomUsers() {
  this.randomUsers = [];

  const firstNames = [
    'John', 'Jane', 'Alice', 'Bob', 'Michael', 'Emily', 'Daniel', 'Sophia', 
    'Chris', 'Jessica', 'David', 'Laura', 'James', 'Olivia', 'Mark', 'Emma',
    'Andrew', 'Lily', 'Ryan', 'Chloe', 'Ethan', 'Isabella', 'Thomas', 'Hannah'
  ];
  
  const lastNames = [
    'Doe', 'Smith', 'Johnson', 'Brown', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 
    'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 
    'Clark', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright'
  ];
  
  const cities = [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 
    'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 
    'Fort Worth', 'Columbus', 'Charlotte', 'Indianapolis', 'San Francisco', 
    'Seattle', 'Denver', 'Washington D.C.', 'Boston', 'El Paso', 'Detroit', 'Nashville'
  ];
  
  const companies = ['TechCorp', 'SolSolutions', 'Jordan Ltd', 'Global', 'Synths4All', 'Blue&Green', 'Future Health'];
  const occupations = ['Engineer', 'Designer', 'Manager', 'Analyst'];
  const licenseNames = ['License A', 'License B', 'License C', 'License D', 'License 05', 'License 06', 'License 07', 'License 08', 'License 09'];

  for (let i = 0; i < 3; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@example.com`;
    const city = cities[Math.floor(Math.random() * cities.length)];
    const company = companies[i % companies.length];
    const occupation = occupations[i % occupations.length];
    
    // Generate random licenses
    const licenseCount = Math.floor(Math.random() * 10);
    let licenses = [];
    for(let j = 0; j < licenseCount; j++ ){
      const singleLicense = { licenseName: licenseNames[Math.floor(Math.random() * licenseNames.length)], value: this.generateRandomDate(), licenseId: this.generateBase64Sequence(length = 16) };
      licenses.push(singleLicense);
    }

    // Generate random custom data
    const customData = [
      { CustomKey: `CustomKey${i + 1}A`, value: `Custom Value ${i + 1}A` },
      { CustomKey: `CustomKey${i + 1}B`, value: `Custom Value ${i + 1}B` }
    ];

    const user = new User({
      firstName: firstName,
      lastName: lastName,
      email: email,
      birthDate: new Date(1990 + i, i, i + 10).getTime(),
      street: `${i + 1} Main St`,
      zipCode: 10000 + i * 100,
      city: city,
      company: company,
      occupation: occupation,
      licenses: licenses,
      customData: customData
    });

    this.randomUsers.push(user);
  }
}

// Method to save each random user one at a time to Firestore
saveRandomUsers() {
  this.randomUsers.forEach((user, index) => {
    setTimeout(() => {
      this.firestoreService.user = user;
      this.firestoreService.saveUser({ close: () => console.log(`User ${index + 1} saved!`) });
    }, index * 500); // Adding delay between saves to avoid simultaneous writes
  });
}


generateBase64Sequence(length = 16) {
  const randomBytes = new Uint8Array(Math.ceil((length * 6) / 8)); // Calculate bytes needed
  crypto.getRandomValues(randomBytes); // Fill with random values

  // Encode to base-64 and truncate to desired length
  return btoa(String.fromCharCode(...randomBytes)).substring(0, length);
}

generateRandomDate(){
  const now = new Date();
  const oneMonthFromNow = new Date(now.setMonth(now.getMonth() + 1)).getTime();
  const threeYearsFromNow = new Date(now.setFullYear(now.getFullYear() + 3)).getTime();
  return new Date(oneMonthFromNow + Math.random() * (threeYearsFromNow - oneMonthFromNow)).getTime();
};

}



