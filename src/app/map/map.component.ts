import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ScriptLoadService } from '../script-load.service';
import { FirebaseApp } from 'angularfire2';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const your_API_key = 'AIzaSyAwVnwE1bEZf_Bkk_pSkGM0XlBSXJocVUY';
const url = 'https://maps.googleapis.com/maps/api/js?key=' + your_API_key;

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

  @ViewChild('mapElement') mapElm: ElementRef;

  constructor(private load: ScriptLoadService, private db: AngularFireDatabase) {

    this.markersRef = this.db.list('/markers');
    this.markers = this.markersRef.snapshotChanges(['child_added']);

  }

  ngAfterViewInit(): void {
    this.load.loadScript(url, 'gmap', () => {
      this.maps = window['google']['maps'];
      console.log(this.maps);
      const loc = new this.maps.LatLng(51.561638, -0.14);
      this.map = new this.maps.Map(this.mapElm.nativeElement, {
        zoom: 11,
        center: loc,
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
      });
    });

  }

}
