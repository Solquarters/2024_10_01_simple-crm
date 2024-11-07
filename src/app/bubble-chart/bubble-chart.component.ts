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
  @ViewChild('chartContainer') private chartContainer!: ElementRef;
  private users: User[] = [];
  private subscription: Subscription = new Subscription();
  private svg: any;
  private simulation: any;
  private tooltip: any;
  private width = 900;
  private height = 800;
  private diameter = 600;

// Define the custom color palette
private customPalette: string[] = [
  '#FFE1B9', '#FFCC8D', '#FDBE72', '#F9AF71', '#F59D70', '#F18C73', '#ED7C75',
  '#E96B73', '#D36075', '#BA5374', '#A44875', '#8A3A75', '#702D76', '#5D2477'
];
//Alternative palette:
// #718db7, #64a9c3, #76c1c0

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit(): void {
    this.subscription = this.firestoreService.users$.subscribe((users) => {
      this.users = users;
      this.renderChart();
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
  // Remove any existing SVG
  d3.select('#bubbleChart').remove();
  const data: UserNode[] = this.processData();
  // Set dimensions
  const diameter = this.diameter;
  const width = this.width; // Should be 1000 to accommodate the legend
  const height = this.height;
  // Create SVG element
  const svg = d3.select('#chartContainer')
    .append('svg')
    .attr('id', 'bubbleChart')
    .attr('width', width)
    .attr('height', height);
  this.svg = svg;
  // Get city names
  const cityNames: string[] = Array.from(new Set(data.map(d => d.city)));
  // Create the color scale using the custom palette
  const color = this.getColorScale(cityNames);
  // Create a scale for circle sizes based on license count
  const maxLicenseCount = d3.max(data, d => d.licenseCount) || 1;
  const radiusScale = d3.scaleLinear()
    .domain([0, maxLicenseCount])
    .range([10, 50]);
    const ticked = () => {
      nodes
        .attr('cx', (d: UserNode) => d.x!)
        .attr('cy', (d: UserNode) => d.y!);
    };
  
  // Adjust the simulation center to account for the legend
  const simulation = d3.forceSimulation<UserNode>(data)
    .force('charge', d3.forceManyBody().strength(10))
    .force('center', d3.forceCenter((width - 200) / 2, height / 2))
    .force('collision', d3.forceCollide(d => radiusScale(d.licenseCount) +1.5))
    .on('tick', ticked);
  this.simulation = simulation;
  // Create circles
  const nodes = svg.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('r', d => radiusScale(d.licenseCount))
    .attr('fill', d => color(d.city))
    .on('mouseover', (event, d) => {
      this.showTooltip(event, d);
    })
    .on('mouseout', () => {
      this.hideTooltip();
    });

  
  // Create a group for the legend
  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${this.width - 160}, 150)`);

  // Create legend items
  const legendItemHeight = 25;
  legend.selectAll('.legend-item')
    .data(cityNames)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(0, ${i * legendItemHeight})`)
    .each(function(d, i) {
      const legendItem = d3.select(this);

      // Append colored circle
      legendItem.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 8)
        .style('fill', color(d));

      // Append city name
      legendItem.append('text')
        .attr('x', 15)
        .attr('y', 5)
        .text(d)
        .style('font-size', '14px')
        .style('fill', 'white') // Set text color to white
        .style('alignment-baseline', 'middle');
    });

  // Add subpoint: "Circle size: License count"
  legend.append('text')
    .attr('x', -7)
    .attr('y', cityNames.length * legendItemHeight + 20)
    .text('Circle size: License count')
    .style('font-size', '14px')
    .style('font-weight', '500')
    .style('fill', 'white'); // Ensure this text is also white
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
      .style('left', (event.pageX -960) + 'px')
      .style('top', (event.pageY - 120) + 'px')
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

  private calculateCityCenters(data: UserNode[]): { [city: string]: { x: number; y: number } } {
    const cities: string[] = Array.from(new Set(data.map(d => d.city)));
    const cityCenters: { [city: string]: { x: number; y: number } } = {};
    const numCities = cities.length;
    const angleStep = (2 * Math.PI) / numCities;
    const radius = this.diameter / 3;
  
    cities.forEach((city, index) => {
      cityCenters[city] = {
        x: this.width / 2 + radius * Math.cos(index * angleStep),
        y: this.height / 2 + radius * Math.sin(index * angleStep),
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

  private calculateLicenseCenters(data: UserNode[]): { [category: string]: { x: number; y: number } } {
    const categories: string[] = Array.from(new Set(data.map(d => d.licenseCategory)));
    const licenseCenters: { [category: string]: { x: number; y: number } } = {};
    const numCategories = categories.length;
    const angleStep = (2 * Math.PI) / numCategories;
    const radius = this.diameter / 3;
  
    categories.forEach((category, index) => {
      licenseCenters[category] = {
        x: this.width / 2 + radius * Math.cos(index * angleStep),
        y: this.height / 2 + radius * Math.sin(index * angleStep),
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

