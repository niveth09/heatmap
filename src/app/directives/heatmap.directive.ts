import {
  AfterViewInit,
  ContentChildren,
  Directive,
  ElementRef,
  Input,
  QueryList,
} from '@angular/core';

import { readableColor, toHex, hsla, parseToHsla } from 'color2k';
import { DataLoaderService } from '../services/data-loader.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[heatMapCell]',
})
export class HeatmapCellDirective {
  @Input('heatMapCell')
  heatMap = 0;

  @Input('id') colId = null;

  constructor(public el: ElementRef<HTMLElement>) {}
}

@Directive({
  selector: '[heatMapColumn]',
})
export class HeatmapColumnDirective {
  @Input('id')
  colId = null;

  @Input('heatMapColumn')
  options = {};
}

@Directive({
  selector: '[heatMapTable]',
})
export class HeatmapTableDirective implements AfterViewInit {
  @ContentChildren(HeatmapCellDirective, {
    descendants: true,
  })
  heatMapCells: QueryList<HeatmapCellDirective>;
  @ContentChildren(HeatmapColumnDirective, { descendants: true })
  heatMapColumns: QueryList<HeatmapColumnDirective>;

  dataLoaderSubscription: Subscription;
  highestValues = {};
  cells: HeatmapCellDirective[] = [];
  columns: HeatmapColumnDirective[] = [];
  config = {};

  constructor(private dataLoader: DataLoaderService) {}

  ngOnInit() {
    this.getData();
  }
  getData() {
    this.dataLoaderSubscription = this.dataLoader
      .getData()
      .subscribe((data) => {
        this.applyHeatMap();
      });
  }
  ngAfterViewInit() {
    this.cells = this.heatMapCells.toArray();
    this.columns = this.heatMapColumns.toArray();
    this.setOptions();
    this.calculateHighestValues();
    this.applyHeatMap();
  }

  private setOptions() {
    this.columns.forEach((col) => {
      this.config = {
        ...this.config,
        [col.colId]: col.options,
      };
    });
  }

  private calculateHighestValues() {
    return this.cells.forEach(({ colId, heatMap }) => {
      if (!Object.prototype.hasOwnProperty.call(this.highestValues, colId)) {
        this.highestValues[colId] = 0;
      }
      if (heatMap > this.highestValues?.[colId])
        this.highestValues[colId] = heatMap;
    });
  }

  private applyHeatMap() {
    this.cells.forEach((cell) => {
      const { bgColor, color } = this.getColor(cell.colId, cell.heatMap);
      if (bgColor) cell.el.nativeElement.style.backgroundColor = bgColor;
      if (color) cell.el.nativeElement.style.color = color;
    });
  }

  private getColor(id: string, value: number) {
    const color = this.config[id].color;

    let textColor = null;
    let bgColor = null;

    if (color != null) {
      const [h, s, l, a] = color;
      const maxLightness = 1 - l;
      const percentage = (value * maxLightness) / this.highestValues[id];
      const lightness = +percentage.toFixed(3);

      // bgColor = hsla(h, s, 1 - lightness, a);
      bgColor = `hsla(${h},${s * 100}%,${Math.round(
        (1 - lightness) * 100
      )}%,${a})`;

      textColor = readableColor(bgColor);
      // console.log(readableColor(bgColor));
    }

    return {
      bgColor,
      color: textColor,
    };
  }
  ngOnDestroy() {
    this.dataLoaderSubscription.unsubscribe();
  }
}
