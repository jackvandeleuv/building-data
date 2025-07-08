import { daysAgoLabel } from '../../utils.js';
import { DEFAULT_BUILDING_IMG, URI } from '../../config.js';

export class SameOwnerParcelCarosel {
    constructor(containerId, owner, parcelpin) {
        this.containerId = containerId;
        this.owner = owner;
        this.parcelpin = parcelpin;
        this.load();
    }

    async load() {
        const url = `http://localhost:5000/same_owner_parcels/${this.owner}`;
        const response = await fetch(encodeURI(url));
        const resultsJSON = await response.json();

        const results = resultsJSON.filter((row) => row.parcelpin !== this.parcelpin);

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
        const url = encodeURI(`${URI}?type=parcel&parcelpin=${row.parcelpin}&owner=${row.deeded_owner_clean}`);

        return `
            <a href="${url}">
                <li class="carosel-item item">
                    <img class="thumb" id="parcelCardImage_${i}" src="${row.photo_link || DEFAULT_BUILDING_IMG}">
                    <div class="details">
                        <h4 class="title">
                            ${row.par_addr_all}
                        </h4>
                        <p class="violation-type">
                            ${row.parcelpin}
                        </p>
                        <p class="meta">
                            Transfered ${daysAgoLabel(new Date(row.transfer_date))}
                        </p>
                    </div>
                    <span class="chevron">›</span>
                </li>
            </a>
        `;
    }
}
