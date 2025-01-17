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
    this.autentykacjaService.user$.subscribe(user => {
      this.currentUser = user.uzytkownik;
      this.log_in = user.zalogowany;
    });
  }


}

