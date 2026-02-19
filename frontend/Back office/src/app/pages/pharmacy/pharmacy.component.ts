import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PharmacyService } from '../../services/pharmacy.service';

export interface Medication {
  id?: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  expirationDate: string;
}

@Component({
  selector: 'app-pharmacy',
  templateUrl: './pharmacy.component.html',
  styleUrls: ['./pharmacy.component.scss'],
  standalone: true,  // ✅ important pour Angular 16+
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule], // ✅ les modules nécessaires
  providers: [DatePipe] // si tu veux utiliser DatePipe dans TS
})
export class PharmacyComponent implements OnInit {
  medications: Medication[] = [];
  pharmacyForm!: FormGroup;
  selectedId: number | null = null;

  constructor(private fb: FormBuilder, private pharmacyService: PharmacyService) {}

  ngOnInit(): void {
    this.pharmacyForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      expirationDate: ['', Validators.required]
    });
    this.loadMedications();
  }

  loadMedications() {
    this.pharmacyService.getAll().subscribe(data => (this.medications = data));
  }

  submit() {
    if (this.pharmacyForm.invalid) return;
    const medication = this.pharmacyForm.value;
    if (this.selectedId) {
      this.pharmacyService.update(this.selectedId, medication).subscribe(() => this.resetForm());
    } else {
      this.pharmacyService.create(medication).subscribe(() => this.resetForm());
    }
  }

  edit(med: Medication) {
    this.selectedId = med.id!;
    this.pharmacyForm.patchValue(med);
  }

  delete(id?: number) {
    if (!id) return;
    if (confirm('Are you sure you want to delete this medication?')) {
      this.pharmacyService.delete(id).subscribe(() => this.loadMedications());
    }
  }

  resetForm() {
    this.pharmacyForm.reset();
    this.selectedId = null;
    this.loadMedications();
  }
}
