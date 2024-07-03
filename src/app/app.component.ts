import {
  Component,
  Inject,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormGroup, FormControl } from '@angular/forms';
import { DataLoaderService } from './services/data-loader.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'heatmap';
  data = [];
  dataLoadSubscription: Subscription;
  @ViewChild('content') contentDiv: ElementRef;
  @ViewChild('heatmap') heatmapDiv: ElementRef;

  options = {
    months: { color: '#309c39' },
    events: { color: [0, 1, 0.4176470588235294, 1] },
  };

  year = new Date().getFullYear();
  monthsList = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  errorMessage: string = '';
  dayForm = new FormGroup({
    day: new FormControl(''),
    startDate: new FormControl(''),
    endDate: new FormControl(''),
  });
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private dataLoader: DataLoaderService
  ) {}
  ngOnInit() {
    this.getData();
    // document.getElementById('date').setAttribute('min', this.year + '-01-01');
    // document.getElementById('date').setAttribute('max', this.year + '-12-31');
  }
  getData() {
    this.dataLoadSubscription = this.dataLoader.getData().subscribe((data) => {
      this.data = data;
    });
  }
  filterData() {
    let startDate: Date | string = this.dayForm.get('startDate').value;
    let endDate: Date | string = this.dayForm.get('endDate').value;

    if (
      this.isNotDateNull(startDate, 'Start Date') &&
      this.isNotDateNull(endDate, 'End Date')
    ) {
      let convertedStartDate = new Date(startDate);
      let convertedEndDate = new Date(endDate);
      if (
        this.isStartDateGreaterThanEndDate(convertedStartDate, convertedEndDate)
      ) {
        let splicedData = this.data.filter((date) => {
          console.log(date.startDate >= startDate || date.endDate <= endDate);
          date.startDate >= startDate || date.endDate <= endDate;
        });
        console.log(splicedData);
      }
    }
  }
  isNotDateNull(date: any, inputName: any) {
    if (!date) {
      this.errorMessage = `${inputName} shouldn't be null`;
      return false;
    }

    return true;
  }
  isStartDateGreaterThanEndDate(startDate: any, endDate: any) {
    console.log(startDate <= endDate);
    console.log(startDate, endDate);
    if (startDate <= endDate) {
      this.errorMessage = 'Start Date should be greater than End Date';
      return false;
    }

    console.log('error', this.errorMessage);
    return true;
  }
  onChangeEventForDay = () => {
    let eventDay = this.dayForm.get('day').value;
    if (eventDay) {
      let splittedDate = eventDay.split('-');
      eventDay = splittedDate[splittedDate.length - 1];
      this.dataLoader.setData(eventDay, this.data);
    }
  };
  ngOnDestroy() {
    this.dataLoadSubscription.unsubscribe();
  }
}
