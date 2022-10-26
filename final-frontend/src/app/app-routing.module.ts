import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {AuthComponent} from "./auth/auth.component";
import {MainComponent} from "./main/main.component";
import {ProfileComponent} from "./profile/profile.component";

const routes: Routes = [
  {path: '', component: AuthComponent},
  {path: 'main', component: MainComponent},
  {path: 'profile', component: ProfileComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }



