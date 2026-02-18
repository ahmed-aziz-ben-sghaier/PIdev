import { Component, OnInit } from '@angular/core';
import { PharmacyService } from '../services/pharmacy.service';

export interface Medication {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  expirationDate: string;
}

@Component({
  selector: 'app-pharmacy',
  templateUrl: './pharmacy.component.html',
  styleUrls: ['./pharmacy.component.scss']
})
export class PharmacyComponent implements OnInit {

  medications: Medication[] = [];
  loading = true;

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit(): void {
    this.loadMedications();
  }

  loadMedications() {
    this.pharmacyService.getAll().subscribe({
      next: (data) => {
        this.medications = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading medications', err);
        this.loading = false;
      }
    });
  }
}
