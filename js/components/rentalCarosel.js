import { daysAgoLabel } from '../utils/utils.js';
import { URI } from '../config.js';

export class RentalCarosel {
    constructor(containerID, data, loaded, imageLinks=[]) {
        this.containerID = containerID;
        this.data = data;
        this.loaded = loaded;
        this.imageLinks = imageLinks;
    }

    makeHTML() {
        let innerHTML = '';
        if (!this.loaded) {
            for (let i = 0; i < 5; i++) {
                const card = new RentalCaroselCard([], this.loaded);
                innerHTML = innerHTML + card.makeHTML();
            }
        } else if (this.data.length === 0) {
            innerHTML = 'No rentals found.';
        } else {
            for (const row of this.data) {
                const card = new RentalCaroselCard(row, this.loaded);
                innerHTML = innerHTML + card.makeHTML();
            }
        }

        return `
            <div class="parcelDetails" id="${this.containerID}">
                ${innerHTML}
            </div>
        `;
    }
}

class RentalCaroselCard {
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

    makeHTML() {
        if (!this.loaded) return this.__makeDefaultHTML();
        
        return `
            <a href="${encodeURI(URI + '?type=rental&record_id=' + this.data.b1_alt_ID)}">
                <li class="carosel-item item">
                    <div class="thumb"></div>
                    <div class="details">
                        <h4 class="title">
                            ${this.data.Status}
                        </h4>
                        <p class="violation-type">
                            ${this.data.b1_alt_ID}
                        </p>
                        <p class="meta">
                            ${this.data.OwnerOrgName}
                        </p>
                        <p class="meta">
                            Last update ${daysAgoLabel(this.data.StatusDate)}
                        </p>
                    </div>
                    <span class="chevron">›</span>
                </li>
            </a>
        `;
    }
}