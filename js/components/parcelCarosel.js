import { daysAgoLabel } from '../utils/utils.js';

export class ParcelCarosel {
    // parcelpin, <PARCELPIN>
    constructor(containerID, data, loaded) {
        this.containerID = containerID;
        this.data = data;
        this.loaded = loaded;
    }

    makeHTML() {
        let innerHTML = '';
        if (!this.loaded) {
            for (let i = 0; i < 3; i++) {
                const card = new ParcelCaroselCard([], this.loaded);
                innerHTML = innerHTML + card.makeHTML();
            }
        } else if (this.data.length === 0) {
            innerHTML = 'No parcels found.';
        } else {
            for (const row of this.data) {
                const card = new ParcelCaroselCard(row, this.loaded);
                innerHTML = innerHTML + card.makeHTML();
            }
        }

        return `
            <div class="parcelDetails", id="${this.containerID}">
                ${innerHTML}
            </div>
        `;
    }
}

class ParcelCaroselCard {
    constructor(data, loaded) {
        this.data = data;
        this.loaded = loaded;
    }

    __makeDefaultHTML() {
        return `
            <li class="carosel-item item">
                <div class="thumb"></div>
                <div class="details">
                    <h3 class="title">Loading...</h3>
                    <p class="violation-type"></p>
                    <p class="meta"></p>
                </div>
                <span class="chevron">›</span>
            </li>
        `;
    }

    makeAddressString() {
        if (this.data === undefined || this.data.length === 0) return '';

        let addressString = [
            this.data.parcel_addr || '',
            this.data.parcel_predir || '',
            this.data.parcel_street || '',
            this.data.parcel_suffix || '',
            this.data.parcel_unit || ''
        ].map((elem) => elem.trim()).join(' ').trim();

        if (this.data.parcel_city !== undefined) {
            addressString = addressString + `, ${this.data.parcel_city}`;
        }

        return addressString;
    }

    makeHTML() {
        if (!this.loaded) return this.__makeDefaultHTML();
        
        const addressString = this.makeAddressString();

        return `
            <li class="carosel-item item">
                <div class="thumb"></div>
                <div class="details">
                    <h4 class="title">
                        ${addressString}
                    </h4>
                    <p class="violation-type">
                        ${this.data.parcelpin}
                    </p>
                    <p class="meta">
                        ${this.data.parcel_owner}
                    </p>
                    <p class="meta">
                        Transfered ${daysAgoLabel(this.data.last_transfer_date)}
                    </p>
                </div>
                <span class="chevron">›</span>
            </li>
        `;
    }
}