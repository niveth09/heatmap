import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DATA } from '../data';

export interface DataEntry {
  x: String;
  y: String;
  value: number;
}

@Injectable({
  providedIn: 'root',
})
export class DataLoaderService {
  send_data = new BehaviorSubject<any>(DATA);
  constructor(private http: HttpClient) {}
  setData(eventDay: any, data: any) {
    data.forEach((element) => {
      if (element.day == eventDay) {
        element.events += 1;
      }
    });
    this.send_data.next(data);
  }
  getData() {
    return this.send_data.asObservable();
  }
}
