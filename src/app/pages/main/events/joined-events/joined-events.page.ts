import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AutentykacjaService } from 'src/app/services/autentykacja.service';

@Component({
  selector: 'app-joined-events',
  templateUrl: './joined-events.page.html',
  styleUrls: ['./joined-events.page.scss'],
  standalone: false,
})
export class JoinedEventsPage implements OnInit {
  public title!: string;
  currentUser: string = '';
  log_in: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private autentykacjaService: AutentykacjaService,
  ) { }

  ngOnInit() {
    this.title = this.activatedRoute.snapshot.queryParamMap.get('title') || '';
    this.autentykacjaService.user$.subscribe(user => {
      this.currentUser = user.uzytkownik;
      this.log_in = user.zalogowany;
    });
  }
  
}
