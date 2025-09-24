import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  constructor() { }

  getCurrentUser(): Observable<User> {
    // Mock user data - replace with actual API call in production
    const mockUser: User = {
      id: '1',
      name: 'Dr. Marie Dubois',
      title: 'Radiologist',
      email: 'marie.dubois@clinique-parc.fr',
      role: 'Radiologist',
      department: 'Radiology',
      avatar: 'assets/public/images/doctor/doctor1.JPG',
      isOnline: true,
      lastActive: new Date()
    };

    return of(mockUser);
  }

  updateUserProfile(user: Partial<User>): Observable<User> {
    // Mock update - replace with actual API call in production
    return this.getCurrentUser();
  }

  getUserById(id: string): Observable<User | null> {
    // Mock implementation - replace with actual API call in production
    if (id === '1') {
      return this.getCurrentUser();
    }
    return of(null);
  }
}