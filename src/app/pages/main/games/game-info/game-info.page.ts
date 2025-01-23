import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AutentykacjaService } from 'src/app/services/autentykacja.service';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { GryService } from 'src/app/services/gry.service';
import { IonicModule, ViewWillEnter } from '@ionic/angular';

interface Gra {
  Name: string;
  Description: string;
  ImagePath: string;
  MaxPlayers?: string;
  MinPlayers?: string;
  MfgAgeRec?: string;
}

@Component({
  selector: 'app-game-info',
  templateUrl: './game-info.page.html',
  styleUrls: ['./game-info.page.scss'],
  standalone: false,
})

export class GameInfoPage implements OnInit, OnDestroy {
  public title!: string;
  currentUser: string = '';
  log_in: boolean = false;
  public wszystkieGry: any[] = [];
  private destroy$ = new Subject<void>();
  searchForm = new FormControl(''); //nowy obiekt klasy, która reprezentuje pojedyncze pole formularza, ('') oznacza, że zaczyna jako puste
  loading: boolean = false;
  public wyniki: Gra[] = [];


  constructor(
    private activatedRoute: ActivatedRoute,
    private autentykacjaService: AutentykacjaService,
    private gryDane: GryService,
  ) { }

  private setupSearch() {
    this.searchForm.valueChanges.pipe( 
        //tworzy Observable, który emituje za każdym razem, kiedy użytkownik wpisuje coś w pole. Pole związane jest dyrektywą [formControl]="searchForm".
        takeUntil(this.destroy$), //odsuksrybuje się, kiedy komponent zostanie zniszczony
        debounceTime(300), //czeka 300 mls przed kolejną emisją
        distinctUntilChanged(), //emituje tylko jeśli obecna wartość jest inna, niż poprzednia
        switchMap(fraza => { //bierze wpisaną frazę i zwraca nowy obiekt Observable, do którego mozna subskrybować.
            this.loading = true;
            return this.gryDane.szukajGry(fraza);
        })
    ).subscribe({ //zapisuje nadesłane dane do zmiennej wyniki, albo zwraca błąd
        next: (daneZAPI: Gra[]) => {
            this.wyniki = daneZAPI;
            this.loading = false;
        },
        error: (err) => {
            console.error('Błąd wyszukiwania:', err);
            if (err.error && err.error.blad) {
              alert(err.error.blad);
            } else if (err.message) {
              alert(`Błąd: ${err.message}`);
            } else {
              alert(`Wystąpił błąd podczas wyszukiwania. Kod błędu: ${err.status} ${err.statusText}`);
            }
            this.loading = false;
        }
    });
  }

  ngOnInit() {
    this.title = this.activatedRoute.snapshot.queryParamMap.get('title') || '';
    this.autentykacjaService.user$.subscribe(user => {
      this.currentUser = user.uzytkownik;
      this.log_in = user.zalogowany;
    });
    this.pobierzGry();
    this.setupSearch();
  }


  private pobierzGry() {
    this.gryDane.pobierzWszystkieGry().subscribe({
      next: (dane: Gra[]) => {
        this.wszystkieGry = dane;
      },
      error: (err) => {
        console.error('Błąd podczas pobierania gier:', err);
      },
    });
  }
 
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}


