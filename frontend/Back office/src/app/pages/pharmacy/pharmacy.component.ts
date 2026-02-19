import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PharmacyService, Medication } from '../../services/pharmacy.service';
import { MedicationRoute } from '../../services/medication-route.enum';

@Component({
  selector: 'app-pharmacy',
  templateUrl: './pharmacy.component.html',
  styleUrls: ['./pharmacy.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  providers: [DatePipe]
})
export class PharmacyComponent implements OnInit {
  medications: Medication[] = [];
  pharmacyForm!: FormGroup;
  selectedId: string | null = null;

  routes = Object.values(MedicationRoute);

  constructor(private fb: FormBuilder, private pharmacyService: PharmacyService) {}

  ngOnInit(): void {
    this.pharmacyForm = this.fb.group({
      medicationName: ['', Validators.required],
      dosage:         [''],
      frequency:      [null],
      route:          [null],
      duration:       [null],
      quantity:       [0, [Validators.required, Validators.min(0)]],
      startDate:      [''],
      endDate:        ['', Validators.required]
    });
    this.loadMedications();
  }

  loadMedications(): void {
    this.pharmacyService.getAll().subscribe(data => (this.medications = data));
  }

  submit(): void {
    if (this.pharmacyForm.invalid) return;
    const medication: Medication = this.pharmacyForm.value;

    if (this.selectedId) {
      this.pharmacyService.update(this.selectedId, medication).subscribe(() => this.resetForm());
    } else {
      this.pharmacyService.create(medication).subscribe(() => this.resetForm());
    }
  }

  edit(med: Medication): void {
    this.selectedId = med.id!;
    this.pharmacyForm.patchValue(med);
  }

  delete(id?: string): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this medication?')) {
      this.pharmacyService.delete(id).subscribe(() => this.loadMedications());
    }
  }

  resetForm(): void {
    this.pharmacyForm.reset();
    this.selectedId = null;
    this.loadMedications();
  }
}