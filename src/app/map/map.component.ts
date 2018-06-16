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
  markers: Observable<any[]>;
  markersCh: Observable<any[]>;

  @ViewChild('mapElement') mapElm: ElementRef;

  constructor(private load: ScriptLoadService, private db: AngularFireDatabase) {

    this.markers = this.db.list('/markers').valueChanges();

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

    this.markers.subscribe(x => {
      console.log(x);
      x.map(c => {
        let marker = new this.maps.Marker({
                position: c.position,
                title: c.title,
                map: this.map
        });
      });
    });
  }

}
