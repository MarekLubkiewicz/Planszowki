import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {

  //private apiUrl = 'http://127.0.0.1:5000';
  private apiUrl = 'https://www.vanilladice.pl/bg-test';

  constructor(private http: HttpClient) { }

  uploadAvatar(file: File, uzytkownik_id: string): Observable<any> {

    const formData = new FormData(); //FormData to wbudowany interfejs w TypeScript, który pozwala na łatwe tworzenie zestawu par klucz-wartość reprezentujących pola formularza. Automatycznie ustawia odpowiednie nagłówki w żądaniu HTTP, ale nie chce dodawać credentiali... :(
    formData.append('avatar', file);
    formData.append('uzytkownik_id', uzytkownik_id);

   
    return this.http.post(`${this.apiUrl}/dodaj-avatar`,formData, { withCredentials: true });

  }

  dodajUlubionaGre(ulubionaGra: { 'ulubiona': String }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/dodaj-do-ulubionych`, ulubionaGra,  { withCredentials: true });
  }

  usunUlubionaGre(ulubionaUsuwanie: { 'ulubionaDoUsuniecia': String }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usun-z-ulubionych`, ulubionaUsuwanie,  { withCredentials: true });
  }

}
