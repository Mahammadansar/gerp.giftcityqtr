import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { InventoryItem } from './app-data.service';

@Injectable({ providedIn: 'root' })
export class InventoryApiService {
  private readonly api = `${environment.apiBaseUrl}/inventory`;

  constructor(private http: HttpClient) {}

  listItems(): Observable<{ data: InventoryItem[] }> {
    return this.http.get<{ data: InventoryItem[] }>(`${this.api}/items`);
  }

  createItem(payload: {
    sku: string;
    name: string;
    category: string;
    size?: string;
    qty: number;
    unit: string;
    reorderLevel: number;
  }): Observable<{ data: InventoryItem }> {
    return this.http.post<{ data: InventoryItem }>(`${this.api}/items`, payload);
  }

  adjustItem(id: string, payload: { movementType: 'IN' | 'OUT' | 'ADJUST'; quantity: number; reason?: string; reference?: string }): Observable<{ data: InventoryItem }> {
    return this.http.patch<{ data: InventoryItem }>(`${this.api}/items/${id}/adjust`, payload);
  }
}
