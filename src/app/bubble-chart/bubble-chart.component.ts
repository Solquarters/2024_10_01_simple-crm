
import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FirestoreService } from '../firestore.service';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { User } from '../../models/user.class';

interface UserNode extends d3.SimulationNodeDatum {
  id?: string; // Make 'id' optional
  firstName: string;
  lastName: string;
  city: string;
  licenseCount: number;
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
  private width = 800;
  private height = 800;
  private diameter = 800;

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
    return this.users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      city: user.city,
      licenseCount: user.licenses ? user.licenses.length : 0
    }));
  }

  renderChart(): void {
    // Remove any existing SVG
    d3.select('#bubbleChart').remove();
  
    const data: UserNode[] = this.processData();
  
    // Set dimensions
    const diameter = this.diameter;
    const width = this.width;
    const height = this.height;
  
    // Create SVG element
    const svg = d3.select('#chartContainer')
      .append('svg')
      .attr('id', 'bubbleChart')
      .attr('width', width)
      .attr('height', height);
  
    this.svg = svg;
  
    // Create a color scale for cities
    const cityNames: string[] = Array.from(new Set(data.map(d => d.city)));
    const color = d3.scaleOrdinal<string, string>()
      .domain(cityNames)
      .range(d3.schemeCategory10);
  
    // Create a scale for circle sizes based on license count
    const maxLicenseCount = d3.max(data, d => d.licenseCount) || 1;
    const radiusScale = d3.scaleLinear()
      .domain([0, maxLicenseCount])
      .range([10, 50]);
  
    // Create simulation
    const simulation = d3.forceSimulation<UserNode>(data)
    .force('charge', d3.forceManyBody().strength(5))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide(d => radiusScale(d.licenseCount) + 2))
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
  
    function ticked() {
      nodes
    .attr('cx', (d: UserNode) => d.x!)
    .attr('cy', (d: UserNode) => d.y!);
    }
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
      .style('left', (event.pageX + 15) + 'px')
      .style('top', (event.pageY - 28) + 'px')
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
      .force('x', d3.forceX<UserNode>(d => cityCenters[d.city].x).strength(0.1))
      .force('y', d3.forceY<UserNode>(d => cityCenters[d.city].y).strength(0.1))
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


  
}

