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

interface UserNode extends d3.SimulationNodeDatum {
  id?: string;
  firstName: string;
  lastName: string;
  city: string;
  licenseCount: number;
  licenseCategory: string;
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

  // Define the custom color palette
  // private customPalette: string[] = [
  //   '#FFE1B9',
  //   '#FFCC8D',
  //   '#FDBE72',
  //   '#F9AF71',
  //   '#F59D70',
  //   '#F18C73',
  //   '#ED7C75',
  //   '#E96B73',
  //   '#D36075',
  //   '#BA5374',
  //   '#A44875',
  //   '#8A3A75',
  //   '#702D76',
  //   '#5D2477',
  // ];

  private customPalette: string[] = [
    '#D73027',  // Very vibrant red for high density
    '#F46D43',
    '#FDAE61',
    '#FEE08B',  // Transitioning to lighter tones
    '#D9EF8B',
    '#A6D96A',
    '#66BD63',  // Moving towards cooler tones
    '#3288BD',
    '#4575B4',  // Strong blue for medium-low density
    '#6198CF',
    '#7AB9E3',  // Fainter blue for low density
    '#92CFE5',
    '#A6DFF1',
    '#D2ECF8',
  ];

  // Property to hold city names and colors for the legend
  public cityColorMap: { city: string; color: string }[] = [];

  constructor(
    private firestoreService: FirestoreService,
    private router: Router
  ) {}

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
    // Remove the tooltip when the component is destroyed
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
  }

  private handleResize(): void {
    this.clearExistingChart();
    this.renderChart();
  }

  private processData(): UserNode[] {
    return this.users.map((user) => {
      const licenseCount = user.licenses ? user.licenses.length : 0;
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        city: user.city,
        licenseCount: licenseCount,
        licenseCategory: this.getLicenseCategory(licenseCount),
      };
    });
  }

  renderChart(): void {
    this.clearExistingChart();
    const data: UserNode[] = this.processData();
    this.setupSvg();
    const cityNames = this.getCityNames(data);
    const color = this.getColorScale(cityNames);
    const radiusScale = this.createRadiusScale(data);
    this.initializeSimulation(data, radiusScale);
    this.createCircles(data, radiusScale, color);

    // Populate cityColorMap for the legend
    this.cityColorMap = cityNames.map((city) => ({
      city: city,
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

  private getCityNames(data: UserNode[]): string[] {
    return Array.from(new Set(data.map((d) => d.city)));
  }

  private createRadiusScale(
    data: UserNode[]
  ): d3.ScaleLinear<number, number> {
    const maxLicenseCount = d3.max(data, (d) => d.licenseCount) || 1;
    const containerWidth = this.chartContainer.nativeElement.offsetWidth;
    return d3
      .scaleLinear()
      .domain([0, maxLicenseCount])
      .range([6, containerWidth / 18]);
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

  private showTooltip(event: any, d: any): void {
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

    this.tooltip
      .html(
        `<strong>${d.firstName} ${d.lastName}</strong><br/>
         City: ${d.city}<br/>
         Licenses: ${d.licenseCount}`
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
    const cityCenters = this.calculateCityCenters(data);

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

  private calculateCityCenters(
    data: UserNode[]
  ): { [city: string]: { x: number; y: number } } {
    const containerWidth = this.chartContainer.nativeElement.offsetWidth;
    const containerHeight = this.chartContainer.nativeElement.offsetHeight;
    const cities: string[] = Array.from(new Set(data.map((d) => d.city)));
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
    const radius = Math.min(containerWidth, containerHeight) / 3;

    categories.forEach((category, index) => {
      licenseCenters[category] = {
        x: containerWidth / 2 + radius * Math.cos(index * angleStep),
        y: containerHeight / 2 + radius * Math.sin(index * angleStep),
      };
    });

    return licenseCenters;
  }

  private getColorScale(
    domainValues: string[]
  ): d3.ScaleOrdinal<string, string> {
    const numColors = domainValues.length;
    const paletteSize = this.customPalette.length;

    let colors: string[] = [];

    if (numColors <= paletteSize) {
      // Select colors evenly from the palette
      colors = domainValues.map((d, i) => {
        const index = Math.floor((i * (paletteSize - 1)) / (numColors - 1));
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

    return d3.scaleOrdinal<string, string>().domain(domainValues).range(colors);
  }
}
