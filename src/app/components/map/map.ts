import * as L from 'leaflet';
import { MapService } from 'src/app/services/map-services/map-service';
import { POIService } from 'src/app/services/map-services/poi-service';
import { UserService } from 'src/app/services/utils-services/user-service';

/**
 Copyright (c)  Université catholique Louvain.  All rights reserved
 Authors:  Jérôme Lemaire, Corentin Lamy, Daubry Benjamin & Marchesini Bruno
 Date: 2018-2019
 This file is part of Stud.UCLouvain
 Licensed under the GPL 3.0 license. See LICENSE file in the project root for full license information.

 Stud.UCLouvain is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Stud.UCLouvain is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Stud.UCLouvain.  If not, see <http://www.gnu.org/licenses/>.
 */
import { Component } from '@angular/core';
import { MenuController, ModalController, Platform } from '@ionic/angular';

import { SearchModal } from './search/search';
import { TransService } from 'src/app/services/utils-services/trans-services';

@Component({
    selector: 'page-map',
    templateUrl: 'map.html',
    styleUrls: ['./map.scss'],
})
export class MapPage {

    title: any;
    zones: any;
    map: L.Map;
    options: L.MapOptions;
    building: L.Marker;

    constructor(
        public modalCtrl: ModalController,
        public platform: Platform,
        public poilocations: POIService,
        public mapService: MapService,
        public userService: UserService,
        public menuController: MenuController,
        public transService: TransService) {
        this.title = 'Carte';
        this.options = {
            layers: [
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
            ],
            zoom: 14,
            center: this.mapService.getCampusLocation(this.userService.campus)
        };
    }

    ionViewDidEnter() {
        this.platform.ready().then(() => {
            this.poilocations.loadResources().then(results => {
                this.zones = results;
            });
        });
        this.menuController.swipeGesture(false);
    }

    onMapReady(map) {
        this.map = map;
        this.centerMapOnPopupOpen();
    }

    centerMapOnPopupOpen() {
        this.map.on('popupopen', (e: L.LeafletEvent) => {
            const popup = e.target._popup;
            const px = this.map.project(popup._latlng, this.map.getZoom());
            px.y -= popup._container.clientHeight / 2;
            this.map.panTo(this.map.unproject(px, this.map.getZoom()), { animate: true });
        });
    }

    async showSearch() {
        const modal = await this.modalCtrl.create({
            component: SearchModal,
            componentProps: {
                items: this.zones
            },
            cssClass: 'search-modal'
        });
        modal.onDidDismiss().then((data: any) => {
            this.showBuilding(data.data);
        });
        await modal.present();
    }

    showBuilding(item) {
        this.updateOrCreateBuildingMarker(item);
        const popup = this.building.getPopup();
        if (popup.isOpen) {
            this.map.fire('popupopen', { popup: popup });
        }
    }

    updateOrCreateBuildingMarker(item) {
        if (this.building) {
            this.building.setLatLng([item.pos.lat, item.pos.lng]).bindPopup(this.generatePopupContent(item)).openPopup();
        } else {
            this.building = L.marker([item.pos.lat, item.pos.lng]).addTo(this.map).bindPopup(this.generatePopupContent(item)).openPopup();
        }
    }

    generatePopupContent(item) {
        let div = `<div><p class="popup-title">${item.id}</p>`;
        div += item.name ? `<p style="width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}</p>` : '';
        div += item.img ? `<img style="width:150px; height: auto;" src="${item.img}" alt="">` : '';
        div += item.address ? `<p style="width: 150px; word-wrap: break-word;">${item.address}</p>` : '';
        div += item.pos ? this.buildDirectionsButton(item.name, item.pos) : '';
        div += `</div>`;
        return div;
    }

    buildDirectionsButton(name, pos) {
      return `<ion-button onClick="${this.openNavigation(name, pos)}" class="disable-hover" color="map" expand="full">
      <ion-icon slot="start" name="map"/></ion-icon>${this.transService.getTranslation('MAP.DIRECTIONS')}</ion-button>`;
    }

    openNavigation(name, pos) {
      const navProtocol = this.platform.is('ios') ? 'maps://' : 'geo:0,0';
      const label = this.platform.is('ios') ? '' : name;
      return `window.open('${navProtocol}?q=${pos.lat},${pos.lng}(${label})','_system')`;
    }
}
