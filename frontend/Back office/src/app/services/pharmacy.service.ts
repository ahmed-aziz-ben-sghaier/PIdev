import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Medication {
  id?: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  expirationDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class PharmacyService {

  // ⚠️ adapte l’URL selon TON backend
  private baseUrl = 'http://localhost:8079/api/medications';

  constructor(private http: HttpClient) {}

  // 🔹 GET ALL (Back Office)
  getAll(): Observable<Medication[]> {
    return this.http.get<Medication[]>(this.baseUrl);
  }

  // 🔹 CREATE
  create(medication: Medication): Observable<Medication> {
    return this.http.post<Medication>(this.baseUrl, medication);
  }

  // 🔹 UPDATE
  update(id: number, medication: Medication): Observable<Medication> {
    return this.http.put<Medication>(`${this.baseUrl}/${id}`, medication);
  }

  // 🔹 DELETE
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
