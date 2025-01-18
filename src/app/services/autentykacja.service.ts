import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutentykacjaService {

  private apiUrl = 'http://127.0.0.1:5000';
  //private apiUrl = 'https://www.vanilladice.pl/bg-test';
  private _user = new BehaviorSubject<any>(null); //
  public user$ = this._user.asObservable(); //reaktywna zmienna pozwala innym komponentom i serwisom w aplikacji na subskrybowanie aktualnego stanu użytkownika


  constructor(private http: HttpClient) { }

  logowanie(nazwa: string, haslo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/logowanie`, { nazwa, haslo }, { withCredentials: true });//Ustawienie 'withCredentials: true' w opcjach zapytania HTTP mówi przeglądarce, aby dołączała ciasteczka do zapytań.
  }

  sprawdzSesje(): Observable<any> {   
    return this.http.get(`${this.apiUrl}/sesja-status`, { withCredentials: true })
      .pipe(
        tap(response => {
          this._user.next(response);
        })
      );
  }

  wylogowanie(): Observable<any> {
    return this.http.post(`${this.apiUrl}/wylogowanie`, {}, { withCredentials: true });
  }

  rejestruj(nazwa: string, haslo: string, email:string): Observable<any> {
    return this.http.post(`${this.apiUrl}/rejestracja`, { nazwa, haslo, email },  { withCredentials: true });
  }

}
