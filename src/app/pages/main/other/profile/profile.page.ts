import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AutentykacjaService } from 'src/app/services/autentykacja.service';
import { AvatarService } from 'src/app/services/avatar.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  public title!: string;
  currentUser: string = '';
  log_in: boolean = false;
  uzytkownik_id: string = '';
  avatar: string = '';

  //Zmienne do avatara
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isUploading = false;
  error: string | null = null;
  router: any;
  
  constructor(
    private activatedRoute: ActivatedRoute,
    private autentykacjaService: AutentykacjaService,
    private avatarService: AvatarService,
  ) { }

  ngOnInit() {
    this.title = this.activatedRoute.snapshot.queryParamMap.get('title') || '';
    this.autentykacjaService.user$.subscribe(user => {
      this.currentUser = user.uzytkownik;
      this.log_in = user.zalogowany;
      this.uzytkownik_id = user.uzytkownik_id;
      this.avatar = user.avatar
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    
    if (file) {
      this.selectedFile = file;
      this.createPreview(file);
      this.error = null; // Resetujemy błąd przy wyborze nowego pliku
    }
  }

  private createPreview(file: File): void {
    const reader = new FileReader();
    
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    
    reader.readAsDataURL(file);
  }

  uploadAvatar(): void {
    if (!this.selectedFile) {
      this.error = 'Nie wybrano pliku';
      return;
    }

    this.isUploading = true;
    this.error = null;

    this.avatarService.uploadAvatar(this.selectedFile, this.uzytkownik_id)
      .subscribe({
        next: (response) => {
          console.log('Plik przesłany pomyślnie', response);
          alert(response.komunikat)
          this.isUploading = false;
        },
        error: (err) => {
          console.error('Błąd podczas przesyłania', err);
          if (err.error && err.error.blad) {
            alert(err.error.blad);
          } else if (err.message) {
            alert(`Błąd: ${err.message}`);
          } else {
            alert(`Wystąpił błąd podczas przesyłania pliku. Kod błędu: ${err.status} ${err.statusText}`);
          }
          this.error = 'Wystąpił błąd podczas przesyłania pliku';
          this.isUploading = false;
        }
      });
  }


}
