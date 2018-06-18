import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ScriptLoadService } from '../script-load.service';
import { FirebaseApp } from 'angularfire2';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const your_API_key = 'AIzaSyAwVnwE1bEZf_Bkk_pSkGM0XlBSXJocVUY';
const url = `https://maps.googleapis.com/maps/api/js?key=${your_API_key}&libraries=geometry`;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

  maps: any;
  map: any;
  markersRef: AngularFireList<any>;
  markers: Observable<any[]>;
  markersArray: Array<any>;
  distanceArray: Array<any>;
  furthest: string;
  telAviv: any;
  infowindow: any;

  @ViewChild('mapElement') mapElm: ElementRef;

  constructor(private load: ScriptLoadService, private db: AngularFireDatabase) {

    this.markersRef = this.db.list('/markers');
    this.markers = this.markersRef.snapshotChanges(['child_added']);
    this.markersArray = [];
    this.distanceArray = [];
    this.furthest = null;
  }

  ngAfterViewInit(): void {
    this.load.loadScript(url, 'gmap', () => {
      this.maps = window['google']['maps'];
      this.telAviv = new this.maps.LatLng(32.064850, 34.763226);
      this.map = new this.maps.Map(this.mapElm.nativeElement, {
        zoom: 3,
        center: this.telAviv,
        scrollwheel: true,
        panControl: false,
        mapTypeControl: false,
        zoomControl: true,
        streetViewControl: false,
        scaleControl: true,
        zoomControlOptions: {
          style: this.maps.ZoomControlStyle.LARGE,
          position: this.maps.ControlPosition.RIGHT_BOTTOM
        }
      });
    });

    this.loadAllMarkers();

    /**
    * Only load new markers
    */

    this.markers
      .subscribe(actions => {
        actions.forEach(action => {
          console.log('MARKER', action.payload.val());
          let c = action.payload.val();
          let marker = new this.maps.Marker({
            position: c.position,
            title: c.title,
            map: this.map
          });
          this.infowindow = new this.maps.InfoWindow({
            content: c.title
          });
          marker.addListener('click', () => {
            this.infowindow.open(this.map, marker);
          });
          this.markersArray[action.payload.key] = marker;
        });
      });
  }

  loadAllMarkers(): void {
    this.db.list('/markers').query.once("value").then(snapshot => {
      snapshot.forEach(child => {
        let c = child.val();
        let marker = new this.maps.Marker({
          position: c.position,
          title: c.title,
          map: this.map
        });
        this.infowindow = new this.maps.InfoWindow({
          content: c.title
        });
        marker.addListener('click', () => {
          this.infowindow.open(this.map, marker);
        });
        this.markersArray[child.key] = marker;
      });
    });

  }

  clearMarkers() {
    let iterator = Object.keys(this.markersArray);
    for (let i = 0; i < iterator.length; i++) {
      console.log(this.markersArray[iterator[i]]);
      this.markersArray[iterator[i]].setMap(null);
    }
  }

  deleteEverything() {
    this.markersRef.remove();
  }

  findLongest() {
    let iterator = Object.keys(this.markersArray);
    for (let i = 0; i < iterator.length; i++) {
      this.distanceArray.push({
        distance: this.calculate(this.markersArray[iterator[i]].getPosition()),
        marker: this.markersArray[iterator[i]]
      });
    }
    this.distanceArray.sort(function(a, b) {
      return b.distance - a.distance;
    });
    console.log(this.distanceArray);
    this.furthest = this.distanceArray[0].marker.getTitle();
    this.map.panTo(this.distanceArray[0].marker.getPosition());
    this.map.setZoom(14);

  }

  calculate(point_a: any) {
	   return Math.round(this.maps.geometry.spherical.computeDistanceBetween(point_a, this.telAviv));
  }

}
