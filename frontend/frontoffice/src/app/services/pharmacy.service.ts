import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Medication {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  expirationDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class PharmacyService {

  // 🔗 URL de ton backend (même que Back-Office)
  private baseUrl = 'http://localhost:8087/api/medications';

  constructor(private http: HttpClient) {}

  // 🔹 GET ALL (Front-Office : consultation)
  getAll(): Observable<Medication[]> {
    return this.http.get<Medication[]>(this.baseUrl);
  }

  // 🔹 GET BY ID (utile plus tard : détails, panier, prescription)
  getById(id: number): Observable<Medication> {
    return this.http.get<Medication>(`${this.baseUrl}/${id}`);
  }
}
