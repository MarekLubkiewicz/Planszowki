import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {

  //private apiUrl = 'http://localhost:5000';
  private apiUrl = 'http://www.vanilladice.pl/bg-test';

  constructor(private http: HttpClient) { }

  uploadAvatar(file: File, uzytkownik_id: string): Observable<any> {

    const formData = new FormData(); //FormData to wbudowany interfejs w TypeScript, który pozwala na łatwe tworzenie zestawu par klucz-wartość reprezentujących pola formularza. Automatycznie ustawia odpowiednie nagłówki w żądaniu HTTP, ale nie chce dodawać credentiali... :(
    formData.append('avatar', file);
    formData.append('uzytkownik_id', uzytkownik_id);

   
    return this.http.post(`${this.apiUrl}/dodaj-avatar`,formData, { withCredentials: true });

  }

}
