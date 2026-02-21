import { Component, OnInit } from '@angular/core';
import { PharmacyService, Medication } from '../services/pharmacy.service';
import { PrescriptionService, Prescription } from '../services/prescription.service';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-pharmacy',
  templateUrl: './pharmacy.component.html',
  styleUrls: ['./pharmacy.component.scss'],
  standalone: false
})
export class PharmacyComponent implements OnInit {

  activeTab: 'medications' | 'prescriptions' = 'medications';

  medications: Medication[] = [];
  loadingMeds = true;
  errorMeds   = false;

  prescriptions: Prescription[] = [];
  loadingRx = true;
  errorRx   = false;
  viewingPrescription: Prescription | null = null;
  currentUserId: string = '';

  constructor(
    private pharmacyService: PharmacyService,
    private prescriptionService: PrescriptionService,
    private keycloak: KeycloakService
  ) {}

  ngOnInit(): void {
    try {
      const instance = this.keycloak.getKeycloakInstance();
      this.currentUserId = instance.subject || '';

      // 🔍 DEBUG — voir exactement ce que Keycloak retourne
      console.log('=== KEYCLOAK DEBUG ===');
      console.log('subject:', instance.subject);
      console.log('tokenParsed:', instance.tokenParsed);
      console.log('preferred_username:', instance.tokenParsed?.['preferred_username']);
      console.log('email:', instance.tokenParsed?.['email']);
      console.log('sub:', instance.tokenParsed?.['sub']);
      console.log('=====================');

    } catch (e) {
      console.warn('⚠️ Keycloak not ready:', e);
    }

    this.loadMedications();
    this.loadPrescriptions();
  }

  loadMedications(): void {
    this.loadingMeds = true;
    this.errorMeds   = false;
    this.pharmacyService.getAll().subscribe({
      next:  data => { this.medications = data; this.loadingMeds = false; },
      error: err  => {
        console.error('❌ Medications error:', err);
        this.loadingMeds = false;
        this.errorMeds = true;
      }
    });
  }

  loadPrescriptions(): void {
    this.loadingRx = true;
    this.errorRx   = false;
    this.prescriptionService.getAll().subscribe({
      next: data => {
        // 🔍 DEBUG — voir ce que l'API retourne
        console.log('=== PRESCRIPTIONS DEBUG ===');
        console.log('Total reçues:', data.length);
        console.log('Prescriptions:', data);
        data.forEach((p, i) => {
          console.log(`[${i}] userId dans prescription: "${p.userId}"`);
          console.log(`[${i}] currentUserId Keycloak:   "${this.currentUserId}"`);
          console.log(`[${i}] Match:`, p.userId === this.currentUserId);
        });
        console.log('===========================');

        // ✅ SANS FILTRE — affiche toutes les prescriptions
        // (le filtre sera réactivé quand userId sera correctement sauvegardé)
        this.prescriptions = data;

        this.loadingRx = false;
      },
      error: err => {
        console.error('❌ Prescriptions error:', err);
        this.loadingRx = false;
        this.errorRx = true;
      }
    });
  }

  view(p: Prescription): void  { this.viewingPrescription = p; }
  closeView(): void            { this.viewingPrescription = null; }

  isExpiringSoon(dateStr?: string): boolean {
    if (!dateStr) return false;
    const diff = (new Date(dateStr).getTime() - Date.now()) / 86400000;
    return diff <= 30 && diff >= 0;
  }

  isExpired(dateStr?: string): boolean {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  }

  statusClass(status?: string): string {
    const map: Record<string, string> = {
      PENDING:   'badge-pending',
      APPROVED:  'badge-approved',
      DISPENSED: 'badge-dispensed',
      COMPLETED: 'badge-completed',
      CANCELLED: 'badge-cancelled'
    };
    return map[status || ''] || '';
  }
}