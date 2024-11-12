

//   // Define the custom color palette
//   // private customPalette: string[] = [
//   //   '#FFE1B9',
//   //   '#FFCC8D',
//   //   '#FDBE72',
//   //   '#F9AF71',
//   //   '#F59D70',
//   //   '#F18C73',
//   //   '#ED7C75',
//   //   '#E96B73',
//   //   '#D36075',
//   //   '#BA5374',
//   //   '#A44875',
//   //   '#8A3A75',
//   //   '#702D76',
//   //   '#5D2477',
//   // ];

//   // private customPalette: string[] = [
//   //   '#D73027',  // Very vibrant red for high density
//   //   '#F46D43',
//   //   '#FDAE61',
//   //   '#FEE08B',  // Transitioning to lighter tones
//   //   '#D9EF8B',
//   //   '#A6D96A',
//   //   '#66BD63',  // Moving towards cooler tones
//   //   '#3288BD',
//   //   '#4575B4',  // Strong blue for medium-low density
//   //   '#6198CF',
//   //   '#7AB9E3',  // Fainter blue for low density
//   //   '#92CFE5',
//   //   '#A6DFF1',
//   //   '#D2ECF8',
//   // ];


import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FirestoreService } from '../firestore.service';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { User } from '../../models/user.class';
import { Router } from '@angular/router';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

interface UserNode extends d3.SimulationNodeDatum {
  id?: string;
  firstName: string;
  lastName: string;
  city: string;
  licenseCount: number;
  licenseCategory: string;
  population: number | 'unknown';
}

@Component({
  selector: 'app-bubble-chart',
  templateUrl: './bubble-chart.component.html',
  styleUrls: ['./bubble-chart.component.scss'],
})
export class BubbleChartComponent implements OnInit, OnDestroy {
  @ViewChild('chartContainer', { static: true })
  private chartContainer!: ElementRef;
  private users: User[] = [];
  private subscription: Subscription = new Subscription();
  private svg: any;
  private simulation: any;
  private tooltip: any;
  private width = 700;
  private height = 700;
  private diameter = 600;

  // City cache
  private cityCacheData: any[] = [];
  private cityCacheLoaded = false;
  private sortedCities: string[] = [];

  // Property to hold city names, populations, and colors for the legend
  public cityColorMap: { city: string; population: number | 'unknown'; color: string }[] = [];

  constructor(
    private firestoreService: FirestoreService,
    private router: Router,
    public firestore: Firestore
  ) {}

  private resizeObserver!: ResizeObserver;

  ngOnInit(): void {
    this.subscription.add(
      this.firestoreService.users$.subscribe((users) => {
        this.users = users;
        if (this.cityCacheLoaded) {
          this.renderChart();
        }
      })
    );
  
    // Fetch citycache data once
    this.fetchCityCacheData();

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.chartContainer.nativeElement);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.resizeObserver) {
      this.resizeObserver.unobserve(this.chartContainer.nativeElement);
      this.resizeObserver.disconnect();
    }
    // Remove the tooltip when the component is destroyed
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
  }

  private fetchCityCacheData(): void {
    const cityCacheCollection = collection(this.firestore, 'citycache');
    getDocs(cityCacheCollection)
      .then((querySnapshot) => {
        this.cityCacheData = querySnapshot.docs.map((doc) => doc.data());
        this.cityCacheLoaded = true;
        if (this.users.length > 0) {
          this.renderChart();
        }
      })
      .catch((error) => {
        console.error('Error fetching city cache data:', error);
      });
  }

  private handleResize(): void {
    this.clearExistingChart();
    this.renderChart();
  }

  private processData(): UserNode[] {
    // Map cityname to population
    const cityPopulationMap = new Map<string, number | 'unknown'>();
    this.cityCacheData.forEach((city) => {
      cityPopulationMap.set(city.cityname, city.population);
    });
  
    return this.users.map((user) => {
      const licenseCount = user.licenses ? user.licenses.length : 0;
      const population = cityPopulationMap.get(user.city) ?? 'unknown';
  
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        city: user.city,
        licenseCount: licenseCount,
        licenseCategory: this.getLicenseCategory(licenseCount),
        population: population,
      };
    });
  }

  renderChart(): void {
    if (!this.cityCacheLoaded || this.users.length === 0) {
      return;
    }
  
    this.clearExistingChart();
    const data: UserNode[] = this.processData();
  
    // Create a Map of city to population
    const cityPopulationMap = new Map<string, number | 'unknown'>();
    this.cityCacheData.forEach((city) => {
      cityPopulationMap.set(city.cityname, city.population);
    });
  
    // Process city names and population data
    const cityNames = Array.from(cityPopulationMap.keys());
  
    // Sort cities by population (descending order)
    const sortedCities = cityNames.sort((a, b) => {
      const popA = cityPopulationMap.get(a);
      const popB = cityPopulationMap.get(b);
    
      if (popA === 'unknown' || popA === undefined) return 1; // 'unknown' or undefined goes to the end
      if (popB === 'unknown' || popB === undefined) return -1;
      return (popB as number) - (popA as number); // descending order
    });

    this.sortedCities = sortedCities;
  
    const color = this.getColorScale(cityPopulationMap, sortedCities);
  
    const radiusScale = this.createRadiusScale(data);
    this.setupSvg();
    this.initializeSimulation(data, radiusScale);
    this.createCircles(data, radiusScale, color);
  
    // Populate cityColorMap for the legend
    this.cityColorMap = this.sortedCities.map((city) => ({
      city: city,
      population: cityPopulationMap.get(city) ?? 'unknown',
      color: color(city),
    }));
  }

  private clearExistingChart(): void {
    d3.select('#bubbleChart').remove();
  }

  private setupSvg(): void {
    const containerWidth = this.chartContainer.nativeElement.offsetWidth;
    const containerHeight = this.chartContainer.nativeElement.offsetHeight;

    this.svg = d3
      .select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('id', 'bubbleChart')
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
  }

  private createRadiusScale(
    data: UserNode[]
  ): d3.ScaleLinear<number, number> {
    const maxLicenseCount = d3.max(data, (d) => d.licenseCount) || 1;
    const containerWidth = this.chartContainer.nativeElement.offsetWidth;
    return d3
      .scaleLinear()
      .domain([0, maxLicenseCount])
      .range([6, containerWidth / 19]);
  }

  private initializeSimulation(
    data: UserNode[],
    radiusScale: d3.ScaleLinear<number, number>
  ): void {
    const containerWidth = this.chartContainer.nativeElement.offsetWidth;
    const containerHeight = this.chartContainer.nativeElement.offsetHeight;
    const ticked = () => this.updateNodePositions();

    this.simulation = d3
      .forceSimulation<UserNode>(data)
      .force('charge', d3.forceManyBody().strength(0))
      .force('center', d3.forceCenter(containerWidth / 2, containerHeight / 2))
      .force(
        'collision',
        d3.forceCollide((d) => radiusScale(d.licenseCount) + 1.5)
      )
      .on('tick', ticked);
  }

  private updateNodePositions(): void {
    this.svg
      .selectAll('circle')
      .attr('cx', (d: UserNode) => d.x!)
      .attr('cy', (d: UserNode) => d.y!);
  }

  private createCircles(
    data: UserNode[],
    radiusScale: d3.ScaleLinear<number, number>,
    color: d3.ScaleOrdinal<string, string>
  ): void {
    const component = this; // Capture the component instance
  
    this.svg
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('r', (d: UserNode) => radiusScale(d.licenseCount))
      .attr('fill', (d: UserNode) => color(d.city))
      .style('cursor', 'pointer')
      .on('mouseover', function (
        this: SVGCircleElement,
        event: MouseEvent,
        d: UserNode
      ) {
        component.showTooltip(event, d);
  
        // Darken the circle color on hover
        d3.select(this)
          .attr('fill', d3.color(color(d.city))!.darker(0.5).toString());
      })
      .on('mouseout', function (
        this: SVGCircleElement,
        event: MouseEvent,
        d: UserNode
      ) {
        component.hideTooltip();
  
        // Reset the circle color when not hovering
        d3.select(this).attr('fill', color(d.city));
      })
      .on('click', (event: MouseEvent, d: UserNode) => {
        this.hideTooltip(); // Hide the tooltip
        this.navigateToUser(d);
      });
  }

  private navigateToUser(user: UserNode): void {
    if (user.id) {
      this.router.navigate(['/user', user.id]);
    } else {
      console.error(
        'User ID is missing. Cannot navigate to user detail page.'
      );
    }
  }

  private showTooltip(event: any, d: UserNode): void {
    if (!this.tooltip) {
      this.tooltip = d3
        .select('body') // Append tooltip to body
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('pointer-events', 'none')
        .style('background', '#fff')
        .style('padding', '10px')
        .style('border', '1px solid #ccc')
        .style('border-radius', '4px')
        .style('color', 'black');
    }

    const populationText = d.population !== 'unknown' ? d.population.toLocaleString() : 'Unknown';

    this.tooltip
      .html(
        `<strong>${d.firstName} ${d.lastName}</strong><br/>
         City: ${d.city}<br/>
         Licenses: ${d.licenseCount}<br/>
         Population: ${populationText}`
      )
      .style('left', event.pageX + 10 + 'px') // Adjust position
      .style('top', event.pageY - 100 + 'px')
      .style('opacity', 1);
  }

  private hideTooltip(): void {
    if (this.tooltip) {
      this.tooltip.style('opacity', 0);
    }
  }

  // Grouping functions remain the same
  groupByCity(): void {
    const data = this.processData();
    const cityCenters = this.calculateCityCenters(this.sortedCities);
  
    this.simulation
      .force(
        'x',
        d3.forceX<UserNode>((d) => cityCenters[d.city].x).strength(0.14)
      )
      .force(
        'y',
        d3.forceY<UserNode>((d) => cityCenters[d.city].y).strength(0.14)
      )
      .alpha(0.5)
      .restart();
  }

  resetGrouping(): void {
    const containerWidth = this.chartContainer.nativeElement.offsetWidth;
    const containerHeight = this.chartContainer.nativeElement.offsetHeight;

    this.simulation
      .force('x', d3.forceX(containerWidth / 2).strength(0.05))
      .force('y', d3.forceY(containerHeight / 2).strength(0.05))
      .alpha(0.5)
      .restart();
  }

  private calculateCityCenters(cities: string[]): { [city: string]: { x: number; y: number } } {
    const containerWidth = this.chartContainer.nativeElement.offsetWidth;
    const containerHeight = this.chartContainer.nativeElement.offsetHeight;
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

  // License count implementation
  groupByLicenseCount(): void {
    const data: UserNode[] = this.processData();
    const licenseCenters = this.calculateLicenseCenters(data);

    this.simulation
      .force(
        'x',
        d3
          .forceX<UserNode>((d) => licenseCenters[d.licenseCategory].x)
          .strength(0.14)
      )
      .force(
        'y',
        d3
          .forceY<UserNode>((d) => licenseCenters[d.licenseCategory].y)
          .strength(0.14)
      )
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

  private calculateLicenseCenters(
    data: UserNode[]
  ): { [category: string]: { x: number; y: number } } {
    const containerWidth = this.chartContainer.nativeElement.offsetWidth;
    const containerHeight = this.chartContainer.nativeElement.offsetHeight;
    const categories: string[] = Array.from(
      new Set(data.map((d) => d.licenseCategory))
    );
    const licenseCenters: {
      [category: string]: { x: number; y: number };
    } = {};
    const numCategories = categories.length;
    const angleStep = (2 * Math.PI) / numCategories;
    const radius = Math.min(containerWidth, containerHeight) / 3.6;

    categories.forEach((category, index) => {
      licenseCenters[category] = {
        x: containerWidth / 2 + radius * Math.cos(index * angleStep),
        y: containerHeight / 2+ radius * Math.sin(index * angleStep),
      };
    });

    return licenseCenters;
  }

  private getColorScale(cityPopulationMap: Map<string, number | 'unknown'>, sortedCities: string[]): d3.ScaleOrdinal<string, string> {
    // Separate cities with known and unknown population
    const knownPopulationCities = sortedCities.filter(city => cityPopulationMap.get(city) !== 'unknown');
    const unknownPopulationCities = sortedCities.filter(city => cityPopulationMap.get(city) === 'unknown');
  
    const numKnownCities = knownPopulationCities.length;
  
    // Create a color scale from dark blue to light yellow
    const colorScale = d3.scaleSequential<string>(d3.interpolateLab('#0c3170', '#d9e7ff'))
      .domain([0, numKnownCities - 1]);
  
    // Map city names to colors
    const cityColors = knownPopulationCities.map((city, index) => ({
      city: city,
      color: colorScale(index)
    }));




  
    // Assign white color to unknown population cities
    unknownPopulationCities.forEach((city) => {
      cityColors.push({
        city: city,
        color: '#525252' // White color for unknown population
      });
    });
  
    // Create a d3.scaleOrdinal with city names as domain and assigned colors as range
    const color = d3.scaleOrdinal<string, string>()
      .domain(cityColors.map(d => d.city))
      .range(cityColors.map(d => d.color));
  
    return color;
  }
}

