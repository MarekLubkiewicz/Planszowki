import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from 'src/app/services/database.service';
import { Event } from 'src/app/models/events';
import { format } from 'date-fns';
import { AlertService } from 'src/app/services/alert.service';
import { AutentykacjaService } from 'src/app/services/autentykacja.service';

@Component({
  selector: 'app-planning',
  templateUrl: './planning.page.html',
  styleUrls: ['./planning.page.scss'],
  standalone: false,
})
export class PlanningPage implements OnInit {
  public title!: string;
  eventForm!: FormGroup;
  currentUser: string = '';
  log_in: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private databaseService: DatabaseService,
    private alertService: AlertService,
    private autentykacjaService: AutentykacjaService,
  ) {}

  ngOnInit() {
    this.title = this.activatedRoute.snapshot.queryParamMap.get('title') || '';
    this.eventForm = this.fb.group({
      name: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      place: ['', Validators.required],
      slots: [0, [Validators.required, Validators.min(1)]],
      owner: ['', Validators.required],
      game1: ['', Validators.required],
      game2: [''],
      game3: [''],
      details: [''],
    });
    this.autentykacjaService.user$.subscribe(user => {
      this.currentUser = user.uzytkownik;
      this.log_in = user.zalogowany;
    });
  }

  submitEvent() {
    if (this.eventForm.valid) {
      const formattedData = format(new Date(this.eventForm.value.date), 'dd.MM.yyyy');

      const eventData: Event = {
        name: this.eventForm.value.name,
        date: formattedData,
        time: this.eventForm.value.time,
        place: this.eventForm.value.place,
        slots: this.eventForm.value.slots,
        owner: this.eventForm.value.owner,
        details: this.eventForm.value.details || '',
        games: {
          game1: {
            game: this.eventForm.value.game1,
            rate: 1, // Domyślna wartość
          },
          game2: this.eventForm.value.game2
            ? { game: this.eventForm.value.game2, rate: 0 }
            : undefined,
          game3: this.eventForm.value.game3
            ? { game: this.eventForm.value.game3, rate: 0 }
            : undefined,
        },
      };

      this.databaseService.addEvent(eventData).subscribe({
        next: () => {
          this.alertService.showAlert('Sukces', 'Wydarzenie zostało dodane');
          this.eventForm.reset();
        },
        error: (err) => {
          this.alertService.showAlert('Błąd', 'Nie udało się dodać wydarzenia');
          console.error('Błąd podczas dodawania wydarzenia', err);
        },
      });
    }
  }
}

