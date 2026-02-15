import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PharmacyService } from '../services/pharmacy.service';

@Component({
  selector: 'app-pharmacy',
  templateUrl: './pharmacy.component.html',
  styleUrls: ['./pharmacy.component.css']
})
export class PharmacyComponent implements OnInit {

  prescriptions: any[] = [];
  filteredPrescriptions: any[] = [];
  form: FormGroup;
  editingId: string | null = null;
  searchTerm: string = '';

  constructor(
    private service: PharmacyService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      prescriptionDate: [''],
      status: [''],
      validUntil: [''],
      instructions: [''],
      consultationId: [''],
      userId: [''],
      prescribedBy: ['']
    });
  }

  ngOnInit(): void {
    this.loadAll();
  }

  // ✅ Load all prescriptions
  loadAll() {
    this.service.getAll().subscribe({
      next: data => {
        this.prescriptions = data || [];
        this.filterPrescriptions();
      },
      error: err => console.error('Error loading prescriptions', err)
    });
  }

  // ✅ Create or Update
  save() {
    const prescription = this.form.value;

    if (this.editingId) {
      this.service.update(this.editingId, prescription).subscribe({
        next: () => {
          this.loadAll();
          this.cancel();
        },
        error: err => console.error(err)
      });
    } else {
      this.service.create(prescription).subscribe({
        next: () => {
          this.loadAll();
          this.cancel();
        },
        error: err => console.error(err)
      });
    }
  }

  // ✅ Edit
  edit(p: any) {
    this.editingId = p.id;
    this.form.patchValue(p);
  }

  // ✅ Delete
  delete(id?: string) {
    if (!id) return;

    this.service.delete(id).subscribe({
      next: () => this.loadAll(),
      error: err => console.error('Error deleting prescription', err)
    });
  }

  // ✅ Cancel
  cancel() {
    this.editingId = null;
    this.form.reset();
  }

  // ✅ Search
  filterPrescriptions() {
    const term = this.searchTerm?.toLowerCase() || '';

    this.filteredPrescriptions = this.prescriptions.filter(p =>
      !term ||
      (p.status || '').toLowerCase().includes(term) ||
      (p.instructions || '').toLowerCase().includes(term) ||
      (p.userId || '').toLowerCase().includes(term) ||
      (p.prescribedBy || '').toLowerCase().includes(term)
    );
  }
}
