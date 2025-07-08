import { daysAgoLabel } from '../../utils.js';
import { DEFAULT_BUILDING_IMG, URI } from '../../config.js';

export class RentalCarosel {
    constructor(containerId, parcelpin) {
        this.containerId = containerId;
        this.parcelpin = parcelpin;
        this.load();
    }

    async load() {
        const url = `http://localhost:5000/rental_registrations_by_parcel/${this.parcelpin}`;
        const response = await fetch(encodeURI(url));
        const results = await response.json();

        if (results.length === 0) {
            document.getElementById(this.containerId).innerHTML = `Found nothing.`;
            return;
        }

        let innerHTML = '';
        let i = 0;
        for (const row of results) {
            innerHTML = innerHTML + this.makeLoadedCard(row, i++);
        }

        document.getElementById(this.containerId).innerHTML = innerHTML;
    }

    makeLoadedCard(row, i) {
        const url = encodeURI(`${URI}?type=rental&record_id=${row.record_id}&parcelpin=${row.parcelpin}&owner=${row.deeded_owner_clean}`);

        return `
            <a href="${url}">
                <li class="carosel-item item">
                    <img class="thumb" id="rentalCardImage_${i}" src="${row.photo_link || DEFAULT_BUILDING_IMG}">
                    <div class="details">
                        <h4 class="title">
                            ${row.status}
                        </h4>
                        <p class="violation-type">
                            ${row.record_id}
                        </p>
                        <p class="meta">
                            ${row.deeded_owner_main_alias}
                        </p>
                        <p class="meta">
                            Last update ${daysAgoLabel(new Date(row.status_date))}
                        </p>
                    </div>
                    <span class="chevron">›</span>
                </li>
            </a>
        `;
    }
}
