import { daysAgoLabel } from '../../utils.js';
import { DEFAULT_BUILDING_IMG, URI } from '../../config.js';

export class SameOwnerComplaintCarosel {
    constructor(containerId, owner) {
        this.containerId = containerId;
        this.owner = owner;
        this.load();
    }

    async load() {
        const url = `http://localhost:5000/same_owner_complaints/${this.owner}`;
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
        const url = encodeURI(`${URI}?type=complaint&record_id=${row.record_id}&parcelpin=${row.parcelpin}&owner=${row.deeded_owner_clean}`);

        return `
            <a href="${url}">
                <li class="carosel-item item">
                    <img class="thumb" id="violationCardImage_${i}" src="${row.photo_link || DEFAULT_BUILDING_IMG}">
                    <div class="details">
                        <h4 class="title">
                            ${row.current_task_status}
                        </h4>
                        <p class="violation-type">
                            ${row.record_id}
                        </p>
                        <p class="meta">
                            ${row.type_of_complaint}
                        </p>
                        <p class="meta">
                            Last update ${daysAgoLabel(new Date(row.last_task_date))}
                        </p>
                    </div>
                    <span class="chevron">›</span>
                </li>
            </a>
        `;
    }
}
