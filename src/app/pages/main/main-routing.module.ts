import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainPage } from './main.page';
import { AuthGuard } from 'src/app/services/auth-guard.service';


const routes: Routes = [
  { 
    path: '', 
    component: MainPage, 
    children: [
      { path: '', redirectTo: 'events/all-events', pathMatch: 'full' },
      {
        path: 'events',
        children: [
          { path: 'tabs', loadChildren: () => import('./events/tabs/tabs.module').then(m => m.TabsPageModule), canActivate: [AuthGuard] },
          { path: 'all-events', loadChildren: () => import('./events/all-events/all-events.module').then(m => m.AllEventsPageModule), canActivate: [AuthGuard] },
        ],
      },
      {
        path: 'games',
        children: [
          { path: 'game-info', loadChildren: () => import('./games/game-info/game-info.module').then(m => m.GameInfoPageModule), canActivate: [AuthGuard] },
          { path: 'tools', loadChildren: () => import('./games/tools/tools.module').then(m => m.ToolsPageModule), canActivate: [AuthGuard] },
        ],
      },
      {
        path: 'other',
        children: [
          { path: 'profile', loadChildren: () => import('./other/profile/profile.module').then(m => m.ProfilePageModule), canActivate: [AuthGuard]},
          { path: 'about', loadChildren: () => import('./other/about/about.module').then(m => m.AboutPageModule), canActivate: [AuthGuard] },
          { path: 'settings', loadChildren: () => import('./other/settings/settings.module').then(m => m.SettingsPageModule), canActivate: [AuthGuard] },
        ],
      },
    ]
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule {}
