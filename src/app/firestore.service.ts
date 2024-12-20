import { Injectable } from '@angular/core';
import { Firestore, collection, onSnapshot, addDoc, doc, docData, deleteDoc, serverTimestamp, where, } from '@angular/fire/firestore';
import { query, orderBy, limit, getDocs} from 'firebase/firestore';

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

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  saveUser(dialogRefInput: any) {
    if (this.birthDate) {
      this.user.birthDate = this.birthDate.getTime();
    }
    this.loading = true;
    const userRef = collection(this.firestore, 'users');
    addDoc(userRef, {
      ...this.user.toJSON(),
      createdServerTimestamp: serverTimestamp()
    })
      .then(() => {
        this.loading = false;
        dialogRefInput.close();
        console.log('User added successfully with server timestamp.');
        // Check and add city to citycache
        this.checkAndAddCityToCache(this.user.city)
          .then(() => {
            console.log('City checked and added to cache if necessary.');
          })
          .catch((error) => {
            console.error('Error checking and adding city to cache:', error);
          });
      })
      .catch((error) => {
        console.error('Error adding user to Firestore:', error);
        this.loading = false;
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



  async deleteNewestUsers(count: number = 3): Promise<void> {
    const usersCollection = collection(this.firestore, 'users');
    
    // Query to get the latest users based on the createdServerTimestamp
    const newestUsersQuery = query(usersCollection, orderBy('createdServerTimestamp', 'desc'), limit(count));
  
    try {
      const querySnapshot = await getDocs(newestUsersQuery);
  
      // Check if there are enough users to delete
      if (querySnapshot.size < count) {
        console.log("Not enough users to delete");
        return;
      }
  
      // Map over the query result to delete each document
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
  
      console.log(`${count} most recent users deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting the newest ${count} users:`, error);
    }
  }

///////CITY FETCH

async checkAndAddCityToCache(cityName: string) {
  try {
    // First, check if the city exists in citycache
    const cityCacheRef = collection(this.firestore, 'citycache');
    const q = query(cityCacheRef, where('cityname', '==', cityName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // City not found in cache, fetch population data
      const population = await this.getCityPopulationFromWikimedia(cityName);

      // Now add the city and population to citycache
      await addDoc(cityCacheRef, { cityname: cityName, population: population });
      console.log(`City ${cityName} added to citycache with population ${population}.`);
    } else {
      // City already in cache, do nothing
      console.log(`City ${cityName} already exists in citycache.`);
    }
  } catch (error) {
    console.error(`Error in checkAndAddCityToCache for city ${cityName}:`, error);
  }
}


async getCityPopulationFromWikimedia(cityName: string): Promise<number | 'unknown'> {
  if (!cityName) {
    console.error("No city name provided");
    throw new Error("No city name provided");
  }

  try {
    // Search for the city QID
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(cityName)}&language=en&format=json&origin=*`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.search || searchData.search.length === 0) {
      console.error("City not found");
      // Return 'unknown' if city is not found
      return 'unknown';
    }

    const cityQID = searchData.search[0].id;

    // Fetch entity data
    const dataUrl = `https://www.wikidata.org/wiki/Special:EntityData/${cityQID}.json`;
    const dataResponse = await fetch(dataUrl);
    const data = await dataResponse.json();

    // Get population claims
    const populationClaims = data.entities[cityQID]?.claims?.P1082;
    if (!populationClaims) {
      console.error("Population data not found");
      // Return 'unknown' if population data is not found
      return 'unknown';
    }

    let latestPopulation: number | null = null;
    let latestDate: Date | null = null;

    for (const claim of populationClaims) {
      const popValue = claim.mainsnak.datavalue?.value;
      const population = parseFloat(popValue.amount || popValue);
      if (isNaN(population)) continue;

      const dateClaim = claim.qualifiers?.P585?.[0]?.datavalue?.value?.time;
      const date = dateClaim ? this.parseWikidataDate(dateClaim) : null;

      if (claim.rank === 'preferred') {
        latestPopulation = population;
        latestDate = date;
        break;
      } else if (date && (!latestDate || date > latestDate)) {
        latestPopulation = population;
        latestDate = date;
      }
    }

    if (latestPopulation !== null) {
      return latestPopulation;
    } else {
      console.error("Could not determine the population data.");
      // Return 'unknown' if population data cannot be determined
      return 'unknown';
    }
  } catch (error) {
    console.error(`Error fetching population data for ${cityName}:`, error);
    // Return 'unknown' if any error occurs during fetch
    return 'unknown';
  }
}

// Helper method to parse Wikidata date format
parseWikidataDate(dateString: string): Date | null {
  if (!dateString) return null;
  dateString = dateString.replace(/^\+/, '').split('T')[0];
  return new Date(dateString);
}

}

