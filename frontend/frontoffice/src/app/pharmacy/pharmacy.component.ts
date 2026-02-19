import { Component, OnInit } from '@angular/core';
import { PharmacyService, Medication } from '../services/pharmacy.service';

@Component({
  selector: 'app-pharmacy',
  templateUrl: './pharmacy.component.html',
  styleUrls: ['./pharmacy.component.scss'],
  standalone: false
})
export class PharmacyComponent implements OnInit {
  medications: Medication[] = [];
  loading = true;
  error = false;

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit(): void {
    this.loadMedications();
  }

  loadMedications(): void {
    this.loading = true;
    this.error = false;
    this.pharmacyService.getAll().subscribe({
      next: (data) => {
        this.medications = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load medications:', err);
        this.loading = false;
        this.error = true;
      }
    });
  }

  isExpiringSoon(dateStr?: string): boolean {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    const now = new Date();
    const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 30 && diffDays >= 0;
  }
}