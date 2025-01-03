import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from "../../model/user/user.model";
import { HttpClient, HttpHeaders } from '@angular/common/http'; 
import { environment } from "../../../environments/environment.prod";
import { levelConfig } from "src/app/model/levelConfiguration/level.configuration.model";
import { ExerciseService } from "src/app/services/exercise/exercise.service"

interface Config {
  expValues: number[];
  badgeValues: number[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private config!: levelConfig;
  private baseUrl = environment.userServiceUrl + '/users/';

  user = new BehaviorSubject<User>(new User());

  constructor(private snackBar: MatSnackBar, private exerciseService: ExerciseService, private http: HttpClient) {}

  private getHttpHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true' 
    });
  }

  getCurrentUser(): Observable<User> {
    return this.user.asObservable();
  }

  getUserExp(): number {
    return this.user.value.exp;
  }

  increaseUserExp(): void {
    this.exerciseService.getLevelConfig().subscribe(
      (data: any) => {
        this.config = data;
        console.log('LevelConfig:', this.config);
      },
      error => {
        console.error('Error fetching level config:', error);
      }
    );

    const currentUser = this.user.value;
    currentUser.exp += 1;
    this.user.next(currentUser);

    if (this.config) {
      switch (currentUser.exp) {
        case this.config.expValues[0]:
          this.showSnackBar('Congratulations! You have reached level 2');
          this.exerciseService.logEvent(currentUser.userName, 'Reached level 2').subscribe({
            next: response => console.log('Log event response:', response),
            error: error => console.error('Error submitting log:', error)
          });
          break;
        case this.config.expValues[1]:
          this.showSnackBar('Congratulations! You have reached level 3');
          this.exerciseService.logEvent(currentUser.userName, 'Reached level 3').subscribe({
            next: response => console.log('Log event response:', response),
            error: error => console.error('Error submitting log:', error)
          });
          break;
        default:
          if (this.config.badgeValues.hasOwnProperty(currentUser.exp)) {
            this.showSnackBar('Congratulations! You have unlocked a new badge, view it on your profile page');
            this.exerciseService.logEvent(currentUser.userName, 'Unlocked a new badge').subscribe({
              next: response => console.log('Log event response:', response),
              error: error => console.error('Error submitting log:', error)
            });
          }
          break;
      }
    }

    this.http.post(`${this.baseUrl}updateExp`, currentUser, { headers: this.getHttpHeaders() }).subscribe(
      response => {
        console.log('User updated successfully', response);
      },
      error => {
        console.error('Error occurred during updating user', error);
      }
    );
  }

  updateUser(newUser: User): void {
    this.user.next(newUser);
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'bottom',
      horizontalPosition: 'center'
    });
  }
}
