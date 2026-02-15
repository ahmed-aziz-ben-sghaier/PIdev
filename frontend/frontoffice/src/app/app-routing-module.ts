import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth-guard';
import {DiagnosticComponent} from './diagnostic/diagnostic.component';
import { PharmacyComponent } from './pharmacy/pharmacy.component';



const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'diagnostic',
    component: DiagnosticComponent
  },
  { path: 'pharmacy',
     component: PharmacyComponent },
  {
    path: '**',
    redirectTo: ''
  },
  {
    path: 'diagnostic',
    component: DiagnosticComponent
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
