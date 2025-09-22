import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUser: User = {
    id: '1',
    name: 'Dr. Smith John',
    title: 'Radiologist',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
  };

  getById(id: string): Observable<User | null> {
    return of(this.currentUser.id === id ? this.currentUser : null).pipe(delay(200));
  }

  search(criteria: { query: string; page: number; pageSize: number }): Observable<{ users: User[]; totalCount: number }> {
    const users = criteria.query ? [] : [this.currentUser];
    return of({ users, totalCount: users.length }).pipe(delay(200));
  }

  create(user: Omit<User, 'id'>): Observable<User> {
    const newUser: User = { ...user, id: Date.now().toString() };
    return of(newUser).pipe(delay(200));
  }

  update(id: string, updates: Partial<User>): Observable<User | null> {
    if (this.currentUser.id === id) {
      this.currentUser = { ...this.currentUser, ...updates };
      return of(this.currentUser).pipe(delay(200));
    }
    return of(null).pipe(delay(200));
  }

  delete(id: string): Observable<boolean> {
    return of(false).pipe(delay(200)); // Cannot delete current user
  }

  getCurrentUser(): Observable<User> {
    return of(this.currentUser).pipe(delay(200));
  }
}