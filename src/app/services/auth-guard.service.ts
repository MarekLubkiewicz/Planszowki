import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AutentykacjaService } from './autentykacja.service';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})

export class AuthGuard implements CanActivate {
  constructor(private autentykacjaService: AutentykacjaService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.autentykacjaService.user$.pipe(
      take(1), // Bierzemy tylko jedną wartość, aby uniknąć ciągłego subskrybowania
      map(user => user?.zalogowany), // Zwraca true/false
      tap(isLoggedIn => {
        if (!isLoggedIn) {
          this.router.navigate(['/home']);
        }
      })
    );
  }
}