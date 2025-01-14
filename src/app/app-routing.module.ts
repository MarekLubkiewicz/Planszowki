import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  { 
    path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  },
  { 
    path: 'logowanie', loadChildren: () => import('./pages/auth/logowanie/logowanie.module').then(m => m.LogowaniePageModule) 
  },
  { 
    path: 'rejestracja', loadChildren: () => import('./pages/auth/rejestracja/rejestracja.module').then(m => m.RejestracjaPageModule) 
  },
  { 
    path: 'main', loadChildren: () => import('./pages/main/main.module').then(m => m.MainPageModule)
  },
  { 
    path: '', redirectTo: 'home', pathMatch: 'full' 
  }
];



@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
