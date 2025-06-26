import { daysAgoLabel } from '../utils/utils.js';
import { URI } from '../config.js';
import { FeatureService } from '../fetchEsri.js';

export class ViolationCarosel {
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
            'https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Violation_Status_History/FeatureServer/0/query',
            [
                'RECORD_ID', 'FILE_DATE', 'PRIMARY_ADDRESS',
                'TASK_NAME', 'TASK_STATUS', 'TASK_SEQUENCE_NUMBER',
                'TYPE_OF_VIOLATION', 'OCCUPANCY_OR_USE', 'ISSUE_DATE',
                'ACCELA_CITIZEN_ACCESS_URL', 'DW_Parcel', 'TASK_DATE'
            ],
            callbackFunction,
            filterStatements,
            false,
            serviceDisabled
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
            <a href="${encodeURI(URI + '?type=violation&record_id=' + row.RECORD_ID)}">
                <li class="carosel-item item">
                    <div class="thumb"></div>
                    <div class="details">
                        <h4 class="title">
                            ${row.TASK_STATUS}
                        </h4>
                        <p class="violation-type">
                            ${row.RECORD_ID}
                        </p>
                        <p class="meta">
                            ${row.TYPE_OF_VIOLATION}
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
        document.getElementById(this.containerID).innerHTML = 'No violations found.';
    }

    renderLoadedComponent() {
        let innerHTML = '';
        for (const row of this.__service.data) {
            innerHTML = innerHTML + this.makeLoadedCard(row);
        }
        document.getElementById(this.containerID).innerHTML = innerHTML;
    }
}
