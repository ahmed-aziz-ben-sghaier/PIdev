import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PharmacyService, Medication } from '../../services/pharmacy.service';
import { PrescriptionService, Prescription, PrescriptionStatus } from '../../services/prescription.service';
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

  // ── Tabs ──────────────────────────────────────
  activeTab: 'medications' | 'prescriptions' = 'medications';

  // ── Medications ───────────────────────────────
  medications: Medication[] = [];
  medicationForm!: FormGroup;
  selectedMedId: string | null = null;

  // ── Prescriptions ─────────────────────────────
  prescriptions: Prescription[] = [];
  prescriptionForm!: FormGroup;
  selectedPrescriptionId: string | null = null;  // ← NOUVEAU
  viewingPrescription: Prescription | null = null;

  // ── Shared ────────────────────────────────────
  routes = Object.values(MedicationRoute);
  statuses: PrescriptionStatus[] = ['PENDING','APPROVED','DISPENSED','COMPLETED','CANCELLED'];

  constructor(
    private fb: FormBuilder,
    private pharmacyService: PharmacyService,
    private prescriptionService: PrescriptionService
  ) {}

  ngOnInit(): void {
    this.initMedicationForm();
    this.initPrescriptionForm();
    this.loadMedications();
    this.loadPrescriptions();
  }

  // ════════════════════════════════════════════════
  // MEDICATION
  // ════════════════════════════════════════════════

  initMedicationForm(): void {
    this.medicationForm = this.fb.group({
      medicationName: ['', Validators.required],
      dosage:         [''],
      frequency:      [null],
      route:          [null],
      duration:       [null],
      quantity:       [0, [Validators.required, Validators.min(0)]],
      startDate:      [''],
      endDate:        ['', Validators.required]
    });
  }

  loadMedications(): void {
    this.pharmacyService.getAll().subscribe(data => this.medications = data);
  }

  submitMedication(): void {
    if (this.medicationForm.invalid) return;
    const med: Medication = this.medicationForm.value;
    if (this.selectedMedId) {
      this.pharmacyService.update(this.selectedMedId, med).subscribe(() => this.resetMedicationForm());
    } else {
      this.pharmacyService.create(med).subscribe(() => this.resetMedicationForm());
    }
  }

  editMedication(med: Medication): void {
    this.selectedMedId = med.id!;
    this.medicationForm.patchValue(med);
    this.activeTab = 'medications';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteMedication(id?: string): void {
    if (!id) return;
    if (confirm('Delete this medication?')) {
      this.pharmacyService.delete(id).subscribe(() => this.loadMedications());
    }
  }

  resetMedicationForm(): void {
    this.medicationForm.reset();
    this.selectedMedId = null;
    this.loadMedications();
  }

  // ════════════════════════════════════════════════
  // PRESCRIPTION
  // ════════════════════════════════════════════════

  initPrescriptionForm(): void {
    this.prescriptionForm = this.fb.group({
      prescriptionDate: ['', Validators.required],
      validUntil:       ['', Validators.required],
      instructions:     [''],
      consultationId:   [''],
      userId:           ['', Validators.required],
      prescribedBy:     ['', Validators.required],
      status:           ['PENDING'],
      medications:      this.fb.array([])
    });
  }

  get medicationsArray(): FormArray {
    return this.prescriptionForm.get('medications') as FormArray;
  }

  newMedicationGroup(data?: any): FormGroup {
    return this.fb.group({
      medicationName: [data?.medicationName || '', Validators.required],
      dosage:         [data?.dosage || ''],
      frequency:      [data?.frequency || null],
      route:          [data?.route || null],
      duration:       [data?.duration || null],
      quantity:       [data?.quantity || 0, [Validators.required, Validators.min(0)]],
      startDate:      [data?.startDate || ''],
      endDate:        [data?.endDate || '']
    });
  }

  addMedication(): void {
    this.medicationsArray.push(this.newMedicationGroup());
  }

  removeMedication(index: number): void {
    this.medicationsArray.removeAt(index);
  }

  loadPrescriptions(): void {
    this.prescriptionService.getAll().subscribe(data => this.prescriptions = data);
  }

  submitPrescription(): void {
  if (this.prescriptionForm.invalid) return;
  const prescription: Prescription = this.prescriptionForm.value;

  if (this.selectedPrescriptionId) {
    // Backend n'a pas PUT /{id} → on delete puis on recrée
    this.prescriptionService.delete(this.selectedPrescriptionId).subscribe(() => {
      this.prescriptionService.create(prescription).subscribe(() => {
        this.resetPrescriptionForm();
      });
    });
  } else {
    this.prescriptionService.create(prescription).subscribe(() => {
      this.resetPrescriptionForm();
    });
  }
}

  // ✅ NOUVEAU — Edit prescription
  editPrescription(p: Prescription): void {
    this.selectedPrescriptionId = p.id!;

    // Vider le FormArray d'abord
    while (this.medicationsArray.length) {
      this.medicationsArray.removeAt(0);
    }

    // Remplir le formulaire avec les données de la prescription
    this.prescriptionForm.patchValue({
      prescriptionDate: p.prescriptionDate,
      validUntil:       p.validUntil,
      instructions:     p.instructions,
      consultationId:   p.consultationId,
      userId:           p.userId,
      prescribedBy:     p.prescribedBy,
      status:           p.status
    });

    // Remplir les médicaments
    if (p.medications && p.medications.length > 0) {
      p.medications.forEach(med => {
        this.medicationsArray.push(this.newMedicationGroup(med));
      });
    }

    // Scroll vers le formulaire
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateStatus(id: string, status: PrescriptionStatus): void {
    this.prescriptionService.updateStatus(id, status).subscribe(() => this.loadPrescriptions());
  }

  deletePrescription(id?: string): void {
    if (!id) return;
    if (confirm('Delete this prescription?')) {
      this.prescriptionService.delete(id).subscribe(() => this.loadPrescriptions());
    }
  }

  viewPrescription(p: Prescription): void {
    this.viewingPrescription = p;
  }

  closeView(): void {
    this.viewingPrescription = null;
  }

  resetPrescriptionForm(): void {
    this.prescriptionForm.reset({ status: 'PENDING' });
    while (this.medicationsArray.length) this.medicationsArray.removeAt(0);
    this.selectedPrescriptionId = null;  // ← RESET
    this.loadPrescriptions();
  }

  // ════════════════════════════════════════════════
  // HELPERS
  // ════════════════════════════════════════════════

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

  isExpired(dateStr?: string): boolean {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  }
}