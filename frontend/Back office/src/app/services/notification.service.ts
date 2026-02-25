import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;  // ← NOUVEAU : pour afficher "il y a X min"
  read: boolean;    // ← NOUVEAU : pour distinguer lu/non-lu
}

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private toasts$ = new BehaviorSubject<Toast[]>([]);
  toasts = this.toasts$.asObservable();

  success(title: string, message: string): void {
    this.add('success', title, message);
  }

  error(title: string, message: string): void {
    this.add('error', title, message);
  }

  warning(title: string, message: string): void {
    this.add('warning', title, message);
  }

  info(title: string, message: string): void {
    this.add('info', title, message);
  }

  private add(type: Toast['type'], title: string, message: string): void {
    const toast: Toast = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),  // ← heure d'arrivée
      read: false             // ← non lu par défaut
    };
    // ✅ Ajoute en tête de liste (plus récent en premier)
    this.toasts$.next([toast, ...this.toasts$.value]);

    // ✅ PAS de setTimeout → reste jusqu'à suppression manuelle
  }

  // Marquer toutes comme lues (quand on ouvre le dropdown)
  markAllRead(): void {
    this.toasts$.next(
      this.toasts$.value.map(t => ({ ...t, read: true }))
    );
  }

  remove(id: string): void {
    this.toasts$.next(this.toasts$.value.filter(t => t.id !== id));
  }

  clearAll(): void {
    this.toasts$.next([]);
  }

  // Nombre de non-lues
  get unreadCount(): number {
    return this.toasts$.value.filter(t => !t.read).length;
  }
}