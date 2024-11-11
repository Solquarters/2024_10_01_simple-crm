import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FirestoreService } from '../firestore.service';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { User } from '../../models/user.class';
interface UserNode extends d3.SimulationNodeDatum {
  id?: string;
  firstName: string;
  lastName: string;
  city: string;
  licenseCount: number;
  licenseCategory: string; // New property
}
@Component({
  selector: 'app-bubble-chart',
  templateUrl: './bubble-chart.component.html',
  styleUrls: ['./bubble-chart.component.scss']
})
export class BubbleChartComponent implements OnInit, OnDestroy {
  @ViewChild('chartContainer', { static: true }) private chartContainer!: ElementRef;
  private users: User[] = [];
  private subscription: Subscription = new Subscription();
  private svg: any;
  private simulation: any;
  private tooltip: any;
  private width = 700;
  private height = 700;
  private diameter = 600;

// Define the custom color palette
private customPalette: string[] = [
  '#FFE1B9', '#FFCC8D', '#FDBE72', '#F9AF71', '#F59D70', '#F18C73', '#ED7C75',
  '#E96B73', '#D36075', '#BA5374', '#A44875', '#8A3A75', '#702D76', '#5D2477'
];
//Alternative palette:
// #718db7, #64a9c3, #76c1c0

  constructor(private firestoreService: FirestoreService) {}

  // ngOnInit(): void {
  //   this.subscription = this.firestoreService.users$.subscribe((users) => {
  //     this.users = users;
  //     this.renderChart();
  //   });
  // }

  // ngOnDestroy(): void {
  //   this.subscription.unsubscribe();
  // }

  // ngOnInit(): void {
  //   // this.subscription = this.firestoreService.users$.subscribe((users) => {
  //   //   this.users = users;
  //   //   this.renderChart();
  //   // });
  //   // window.addEventListener('resize', this.handleResize.bind(this));
  // }

  // ngAfterViewInit(): void {
  //   this.subscription = this.firestoreService.users$.subscribe((users) => {
  //     this.users = users;
  //     this.renderChart();
  //   });
  //   window.addEventListener('resize', this.handleResize.bind(this));
  // }
  
  
  // ngOnDestroy(): void {
  //   this.subscription.unsubscribe();
  //   window.removeEventListener('resize', this.handleResize.bind(this));
  // }
  private resizeObserver!: ResizeObserver;

  ngOnInit(): void {
    this.subscription = this.firestoreService.users$.subscribe((users) => {
      this.users = users;
      this.renderChart();
    });
  
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.chartContainer.nativeElement);
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.resizeObserver) {
      this.resizeObserver.unobserve(this.chartContainer.nativeElement);
      this.resizeObserver.disconnect();
    }
  }

  private handleResize(): void {
    this.clearExistingChart();
    this.renderChart();
  }

  private processData(): UserNode[] {
    return this.users.map(user => {
      const licenseCount = user.licenses ? user.licenses.length : 0;
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        city: user.city,
        licenseCount: licenseCount,
        licenseCategory: this.getLicenseCategory(licenseCount) // New property
      };
    });
  }

renderChart(): void {
  this.clearExistingChart();
  const data: UserNode[] = this.processData();
  this.setupSvg();
  const color = this.getColorScale(this.getCityNames(data));
  const radiusScale = this.createRadiusScale(data);
  this.initializeSimulation(data, radiusScale);
  this.createCircles(data, radiusScale, color);
  this.createLegend(color, this.getCityNames(data));
}

private clearExistingChart(): void {
  d3.select('#bubbleChart').remove();
}

// private setupSvg(): void {
//   this.svg = d3.select('#chartContainer')
//     .append('svg')
//     .attr('id', 'bubbleChart')
//     .attr('width', this.width)
//     .attr('height', this.height);
// }
private setupSvg(): void {
  const containerWidth = this.chartContainer.nativeElement.offsetWidth;
  const containerHeight = this.chartContainer.nativeElement.offsetHeight;

  console.log('Container Dimensions:', containerWidth, containerHeight);

  this.svg = d3.select(this.chartContainer.nativeElement)
    .append('svg')
    .attr('id', 'bubbleChart')
    .attr('width', containerWidth)
    .attr('height', containerHeight)
    .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
    .attr('preserveAspectRatio', 'xMidYMid meet'); // Ensure aspect ratio is maintained
}

private getCityNames(data: UserNode[]): string[] {
  return Array.from(new Set(data.map(d => d.city)));
}

// private createRadiusScale(data: UserNode[]): d3.ScaleLinear<number, number> {
//   const maxLicenseCount = d3.max(data, d => d.licenseCount) || 1;
//   return d3.scaleLinear()
//     .domain([0, maxLicenseCount])
//     .range([10, 50]);
// }

// private createRadiusScale(data: UserNode[]): d3.ScaleLinear<number, number> {
//   const maxLicenseCount = d3.max(data, d => d.licenseCount) || 1;
//   const containerWidth = this.chartContainer.nativeElement.offsetWidth;
//   return d3.scaleLinear()
//     .domain([0, maxLicenseCount])
//     .range([5, containerWidth / 15]); // Adjust based on container size
// }
private createRadiusScale(data: UserNode[]): d3.ScaleLinear<number, number> {
  const maxLicenseCount = d3.max(data, d => d.licenseCount) || 1;
  const containerWidth = this.chartContainer.nativeElement.offsetWidth;
  return d3.scaleLinear()
    .domain([0, maxLicenseCount])
    .range([5, containerWidth / 15]); // Adjust based on container size
}

// private initializeSimulation(data: UserNode[], radiusScale: d3.ScaleLinear<number, number>): void {
//   const ticked = () => this.updateNodePositions();
//   this.simulation = d3.forceSimulation<UserNode>(data)
//     .force('charge', d3.forceManyBody().strength(10))
//     .force('center', d3.forceCenter(this.width / 2, this.height / 2))
//     .force('collision', d3.forceCollide(d => radiusScale(d.licenseCount) + 1.5))
//     .on('tick', ticked);
// }
// private initializeSimulation(data: UserNode[], radiusScale: d3.ScaleLinear<number, number>): void {
//   const containerWidth = this.chartContainer.nativeElement.offsetWidth;
//   const containerHeight = this.chartContainer.nativeElement.offsetHeight;
//   const ticked = () => this.updateNodePositions();
//   this.simulation = d3.forceSimulation<UserNode>(data)
//     .force('charge', d3.forceManyBody().strength(10))
//     .force('center', d3.forceCenter(containerWidth / 2, containerHeight / 2))
//     .force('collision', d3.forceCollide(d => radiusScale(d.licenseCount) + 1.5))
//     .on('tick', ticked);
// }
private initializeSimulation(data: UserNode[], radiusScale: d3.ScaleLinear<number, number>): void {
  const containerWidth = this.chartContainer.nativeElement.offsetWidth;
  const containerHeight = this.chartContainer.nativeElement.offsetHeight;
  const ticked = () => this.updateNodePositions();

  this.simulation = d3.forceSimulation<UserNode>(data)
    .force('charge', d3.forceManyBody().strength(10))
    .force('center', d3.forceCenter(containerWidth / 2, containerHeight / 2))
    .force('collision', d3.forceCollide(d => radiusScale(d.licenseCount) + 1.5))
    .on('tick', ticked);
}

private updateNodePositions(): void {
  this.svg.selectAll('circle')
    .attr('cx', (d: UserNode) => d.x!)
    .attr('cy', (d: UserNode) => d.y!);
}

private createCircles(data: UserNode[], radiusScale: d3.ScaleLinear<number, number>, color: d3.ScaleOrdinal<string, string>): void {
  const nodes = this.svg.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('r', (d: UserNode) => radiusScale(d.licenseCount))
    .attr('fill', (d: UserNode) => color(d.city))
    .on('mouseover', (event: MouseEvent, d: UserNode) => this.showTooltip(event, d))
    .on('mouseout', () => this.hideTooltip());
}

private createLegend(color: d3.ScaleOrdinal<string, string>, cityNames: string[]): void {
  // const containerWidth = this.chartContainer.nativeElement.offsetWidth;
  // const legend = this.svg.append('g')
  //   .attr('class', 'legend')
  //   .attr('transform', `translate(${containerWidth - 160}, 150)`);
  const containerWidth = this.chartContainer.nativeElement.offsetWidth;
  const legendX = containerWidth > 500 ? containerWidth - 160 : 20; // Adjust position based on width

  const legend = this.svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${legendX}, 20)`); // Position at top-right or top-left


  // const legend = this.svg.append('g')
  //   .attr('class', 'legend')
  //   .attr('transform', `translate(${this.width - 160}, 150)`);

    legend.selectAll('.legend-item')
    .data(cityNames)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d: string, i: number) => `translate(0, ${i * 25})`)
    .each((d: string, i: number, nodes: Array<SVGGElement>) => this.createLegendItem(d, color, nodes[i]));

  legend.append('text')
    .attr('x', -7)
    .attr('y', cityNames.length * 25 + 20)
    .text('Circle size: License count')
    .style('font-size', '14px')
    .style('font-weight', '500')
    .style('fill', 'white');
}

private createLegendItem(city: string, color: d3.ScaleOrdinal<string, string>, node: Element): void {
  const legendItem = d3.select(node);
  legendItem.append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 8)
    .style('fill', color(city));

  legendItem.append('text')
    .attr('x', 15)
    .attr('y', 5)
    .text(city)
    .style('font-size', '14px')
    .style('fill', 'white')
    .style('alignment-baseline', 'middle');
}

  private showTooltip(event: any, d: any): void {
    if (!this.tooltip) {
      this.tooltip = d3.select('#chartContainer')
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('pointer-events', 'none')
        .style('background', '#fff')
        .style('padding', '10px')
        .style('border', '1px solid #ccc')
        .style('border-radius', '4px')
        .style('color', 'black'); // Ensure text color is set
    }
  
    this.tooltip
      .html(`<strong>${d.firstName} ${d.lastName}</strong><br/>
             City: ${d.city}<br/>
             Licenses: ${d.licenseCount}`)
      .style('left', (event.pageX/2.3 ) + 'px')
      .style('top', (event.pageY/2 ) + 'px')
      .style('opacity', 1);
  }

  private hideTooltip(): void {
    if (this.tooltip) {
      this.tooltip.style('opacity', 0);
    }
  }

  groupByCity(): void {
    const data = this.processData();
    const cityCenters = this.calculateCityCenters(data);
  
    this.simulation
      .force('x', d3.forceX<UserNode>(d => cityCenters[d.city].x).strength(0.11))
      .force('y', d3.forceY<UserNode>(d => cityCenters[d.city].y).strength(0.11))
      .alpha(0.5)
      .restart();
  }

  resetGrouping(): void {
    this.simulation
      .force('x', d3.forceX(this.width / 2).strength(0.05))
      .force('y', d3.forceY(this.height / 2).strength(0.05))
      .alpha(0.5)
      .restart();
  }

  // private calculateCityCenters(data: UserNode[]): { [city: string]: { x: number; y: number } } {
  //   const cities: string[] = Array.from(new Set(data.map(d => d.city)));
  //   const cityCenters: { [city: string]: { x: number; y: number } } = {};
  //   const numCities = cities.length;
  //   const angleStep = (2 * Math.PI) / numCities;
  //   const radius = this.diameter / 3;
  
  //   cities.forEach((city, index) => {
  //     cityCenters[city] = {
  //       x: this.width / 2 + radius * Math.cos(index * angleStep),
  //       y: this.height / 2 + radius * Math.sin(index * angleStep),
  //     };
  //   });
  
  //   return cityCenters;
  // }
  private calculateCityCenters(data: UserNode[]): { [city: string]: { x: number; y: number } } {
    const containerWidth = this.chartContainer.nativeElement.offsetWidth;
    const containerHeight = this.chartContainer.nativeElement.offsetHeight;
    const cities: string[] = Array.from(new Set(data.map(d => d.city)));
    const cityCenters: { [city: string]: { x: number; y: number } } = {};
    const numCities = cities.length;
    const angleStep = (2 * Math.PI) / numCities;
    const radius = Math.min(containerWidth, containerHeight) / 3;
  
    cities.forEach((city, index) => {
      cityCenters[city] = {
        x: containerWidth / 2 + radius * Math.cos(index * angleStep),
        y: containerHeight / 2 + radius * Math.sin(index * angleStep),
      };
    });
  
    return cityCenters;
  }

  //////////////////License count implementation 
  groupByLicenseCount(): void {
    const data: UserNode[] = this.processData();
    const licenseCenters = this.calculateLicenseCenters(data);
  
    this.simulation
      .force('x', d3.forceX<UserNode>(d => licenseCenters[d.licenseCategory].x).strength(0.11))
      .force('y', d3.forceY<UserNode>(d => licenseCenters[d.licenseCategory].y).strength(0.11))
      .alpha(0.5)
      .restart();
  }

  private getLicenseCategory(licenseCount: number): string {
    if (licenseCount === 0) {
      return 'No Licenses';
    } else if (licenseCount <= 2) {
      return '1-2 Licenses';
    } else if (licenseCount <= 5) {
      return '3-5 Licenses';
    } else {
      return '6+ Licenses';
    }
  }

  // private calculateLicenseCenters(data: UserNode[]): { [category: string]: { x: number; y: number } } {
  //   const categories: string[] = Array.from(new Set(data.map(d => d.licenseCategory)));
  //   const licenseCenters: { [category: string]: { x: number; y: number } } = {};
  //   const numCategories = categories.length;
  //   const angleStep = (2 * Math.PI) / numCategories;
  //   const radius = this.diameter / 3;
  
  //   categories.forEach((category, index) => {
  //     licenseCenters[category] = {
  //       x: this.width / 2 + radius * Math.cos(index * angleStep),
  //       y: this.height / 2 + radius * Math.sin(index * angleStep),
  //     };
  //   });
  
  //   return licenseCenters;
  // }
  private calculateLicenseCenters(data: UserNode[]): { [category: string]: { x: number; y: number } } {
    const containerWidth = this.chartContainer.nativeElement.offsetWidth;
    const containerHeight = this.chartContainer.nativeElement.offsetHeight;
    const categories: string[] = Array.from(new Set(data.map(d => d.licenseCategory)));
    const licenseCenters: { [category: string]: { x: number; y: number } } = {};
    const numCategories = categories.length;
    const angleStep = (2 * Math.PI) / numCategories;
    const radius = Math.min(containerWidth, containerHeight) / 3;
  
    categories.forEach((category, index) => {
      licenseCenters[category] = {
        x: containerWidth / 2 + radius * Math.cos(index * angleStep),
        y: containerHeight / 2 + radius * Math.sin(index * angleStep),
      };
    });
  
    return licenseCenters;
  }

  private getColorScale(domainValues: string[]): d3.ScaleOrdinal<string, string> {
    const numColors = domainValues.length;
    const paletteSize = this.customPalette.length;
  
    let colors: string[] = [];
  
    if (numColors <= paletteSize) {
      // Select colors evenly from the palette
      colors = domainValues.map((d, i) => {
        const index = Math.floor(i * (paletteSize - 1) / (numColors - 1));
        return this.customPalette[index];
      });
    } else {
      // Generate additional colors by interpolating the palette
      colors = domainValues.map((d, i) => {
        const t = i / (numColors - 1);
        const color = d3.interpolateRgbBasis(this.customPalette)(t);
        return color;
      });
    }
  
    return d3.scaleOrdinal<string, string>()
      .domain(domainValues)
      .range(colors);
  }
}

