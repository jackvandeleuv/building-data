import { daysAgoLabel } from '../utils/utils.js';

export class ComplaintCarosel {
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
                const card = new ComplaintCaroselCard([], this.loaded);
                innerHTML = innerHTML + card.makeHTML();
            }
        } else if (this.data.length === 0) {
            innerHTML = 'No parcels found.';
        } else {
            for (const row of this.data) {
                const card = new ComplaintCaroselCard(row, this.loaded);
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

class ComplaintCaroselCard {
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
            <li class="carosel-item item">
                <div class="thumb"></div>
                <div class="details">
                    <h4 class="title">
                        ${this.data.CURRENT_TASK_STATUS}
                    </h4>
                    <p class="violation-type">
                        ${this.data.PERMIT_ID}
                    </p>
                    <p class="meta">
                        ${this.data.TYPE_OF_COMPLAINT}
                    </p>
                    <p class="meta">
                        Last update ${daysAgoLabel(this.data.TASK_DATE)}
                    </p>
                </div>
                <span class="chevron">›</span>
            </li>
        `;
    }
}