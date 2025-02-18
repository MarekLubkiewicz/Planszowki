import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AutentykacjaService } from 'src/app/services/autentykacja.service';
import { AvatarService } from 'src/app/services/avatar.service';
import Swal from 'sweetalert2';

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
  email: string ='';
  ulubiona: string ='';
  ulubione: string[] = [];
  gra: string = '';

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
      this.avatar = user.avatar;
      this.email = user.email;
      this.ulubione = user.ulubione;
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
  

  uploadAvatar() {
    if (!this.selectedFile) {
      Swal.fire('Błąd', 'Nie wybrano pliku do przesłania.', 'error');
      return;
    }

    this.isUploading = true;

    // Pokazanie animacji ładowania
    Swal.fire({
      title: 'Przesyłanie...',
      text: 'Proszę czekać',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(null);
      }
    });

    this.avatarService.uploadAvatar(this.selectedFile, this.uzytkownik_id).subscribe({
      next: (response) => {
        Swal.fire('Sukces!', response.komunikat, 'success');
        this.isUploading = false;

        // Odśwież dane użytkownika po udanym przesłaniu avatara
        this.autentykacjaService.sprawdzSesje().subscribe(user => {
          this.avatar = user.avatar;
        });
      },
      error: (error) => {
        console.error('Błąd podczas przesyłania', error);
        let errorMessage = 'Wystąpił błąd podczas przesyłania pliku.';
        Swal.fire('Błąd!', errorMessage, 'error');
        this.isUploading = false;
      }
    });
  }

  dodajGreDoUlubionych(ulubiona: String) {
  const ulubionaGra = { 'ulubiona' : ulubiona };
  this.avatarService.dodajUlubionaGre(ulubionaGra).subscribe({
    next: (response) => {
      Swal.fire('Sukces!', response.komunikat, 'success');
      this.isUploading = false;

      // Odśwież dane użytkownika
      this.autentykacjaService.sprawdzSesje().subscribe(user => {
        this.ulubiona = user.ulubiona;
      });
    },
    error: (error) => {
      console.error('Błąd podczas przesyłania', error);
      let errorMessage = 'Wystąpił błąd podczas dodawania gry.';

      Swal.fire('Błąd!', errorMessage, 'error');
      this.isUploading = false;
    }
  });
}

usunGreZUlubionych(gra: String) {
  const ulubionaUsuwanie = { 'ulubionaDoUsuniecia' : gra };
  this.avatarService.usunUlubionaGre(ulubionaUsuwanie).subscribe({
    next: (response) => {
      Swal.fire('Sukces!', response.komunikat, 'success');
      this.isUploading = false;

      // Odśwież dane użytkownika
      this.autentykacjaService.sprawdzSesje().subscribe(user => {
        this.ulubiona = user.ulubiona;
      });
    },
    error: (error) => {
      console.error('Błąd podczas przesyłania', error);
      let errorMessage = 'Wystąpił błąd podczas usuwania gry.';

      Swal.fire('Błąd!', errorMessage, 'error');

      this.isUploading = false;
    }
  });
}


}