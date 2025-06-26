import { daysAgoLabel } from '../utils/utils.js';
import { URI } from '../config.js';
import { FeatureService } from '../fetchEsri.js';

export class ComplaintCarosel {
    constructor(containerID) {
        this.containerID = containerID;
        this.__loaded = false;
        this.__loading = false;
    }

    isLoaded() {
        return this.__loaded;
    }

    isLoading() {
        return this.__loading;
    }

    async load(callbackFunction, filterStatements) {
        if (this.__loading || this.__loaded) return;
        this.__loading = true;

        this.__service = new FeatureService(
            'https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Complaint_Status_History/FeatureServer/0/query',
            [
                'PERMIT_ID', 'FILE_DATE', 'SOURCE',
                'CURRENT_TASK', 'CURRENT_TASK_STATUS', 'TASK_DATE',
                'TYPE_OF_COMPLAINT', 'DW_Parcel'
            ],
            callbackFunction,
            filterStatements
        );
        await this.__service.load();

        if (this.__service.isLoaded()) {
            renderLoadedComponent()
        } else {
            renderEmptyComponent()
        }

        this.__loaded = this.__service.isLoaded();
        this.__loading = false;
    }

    makeLoadedCard(row) {
        return `
            <a href="${encodeURI(URI + '?type=complaint&record_id=' + row.PERMIT_ID)}">
                <li class="carosel-item item">
                    <div class="thumb"></div>
                    <div class="details">
                        <h4 class="title">
                            ${row.CURRENT_TASK_STATUS}
                        </h4>
                        <p class="violation-type">
                            ${row.PERMIT_ID}
                        </p>
                        <p class="meta">
                            ${row.TYPE_OF_COMPLAINT}
                        </p>
                        <p class="meta">
                            Last update ${daysAgoLabel(row.TASK_DATE)}
                        </p>
                    </div>
                    <span class="chevron">›</span>
                </li>
            </a>
        `;
    }

    renderEmptyComponent() {
        document.getElementById(this.containerID).innerHTML = 'No complaints found.';
    }

    renderLoadedComponent() {
        let innerHTML = '';
        for (const row of this.__service.data) {
            innerHTML = innerHTML + this.makeLoadedCard(row);
        }
        document.getElementById(this.containerID).innerHTML = innerHTML;
    }
}
