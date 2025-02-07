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
      error: (err) => {
        console.error('Błąd podczas przesyłania', err);
        let errorMessage = 'Wystąpił błąd podczas przesyłania pliku.';

        if (err.error && err.error.blad) {
          errorMessage = err.error.blad;
        } else if (err.message) {
          errorMessage = `Błąd: ${err.message}`;
        } else {
          errorMessage = `Kod błędu: ${err.status} ${err.statusText}`;
        }

        Swal.fire('Błąd!', errorMessage, 'error');

        this.error = errorMessage;
        this.isUploading = false;
      }
    });
  }


}