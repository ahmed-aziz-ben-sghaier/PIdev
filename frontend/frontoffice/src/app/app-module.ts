import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing-module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { HomeComponent } from './home/home.component';
import { DiagnosticComponent } from './diagnostic/diagnostic.component';
import { PharmacyComponent } from './pharmacy/pharmacy.component';
import { HospitalizationComponent } from './hospitalization/hospitalization.component';

import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import keycloakConfig from './keycloak.config';

function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: keycloakConfig,
      initOptions: {
        onLoad: 'login-required',
        checkLoginIframe: false
      }
    });
}

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    DiagnosticComponent,
    PharmacyComponent,
    HospitalizationComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    KeycloakAngularModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
