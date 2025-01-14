import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class GryService {

  private apiUrl = 'https://www.vanilladice.pl/bg-test';
  
  constructor(private http: HttpClient) { }

  pobierzWszystkieGry(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/gry?q=%`, { withCredentials: true });
  }

  szukajGry(term: string | null): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/gry?q=${term}`, { withCredentials: true });
  }

}
