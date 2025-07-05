import { FeatureService } from "../../fetchEsri.js";

export class ViolationBody {
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
            (() => {}),
            filterStatements
        );
        await this.__service.load();

        if (this.__service.isLoaded()) {
            this.renderLoadedComponent()
        } else {
            this.renderEmptyComponent()
        }

        if (this.__service.data === undefined || this.__service.data.length === 0) {
            this.__loaded = false;
            this.__loading = false;
            return;
        }

        this.parcel = this.__service.data[0].DW_Parcel || '';
        this.__loaded = this.__service.isLoaded();
        this.__loading = false;
        callbackFunction();
    }

    renderLoadedComponent() {
        const row = this.__service.data[0];
        
        document.getElementById(this.containerID).innerHTML = `
            <h1>${row.RECORD_ID}</h1>
            <p class="parcelPageSubHeader">${row.DW_Parcel}</p>
            <ul>
                <li>CURRENT_TASK: ${row.CURRENT_TASK}</li>
                <li>CURRENT_TASK_STATUS: ${row.CURRENT_TASK_STATUS}</li>
                <li>FILE_DATE: ${row.FILE_DATE}</li>
                <li>SOURCE: ${row.SOURCE}</li>
                <li>TASK_DATE: ${row.TASK_DATE}</li>
                <li>TYPE_OF_COMPLAINT: ${row.TYPE_OF_COMPLAINT}</li>
            </ul>
    `;
    }

    renderEmptyComponent() {
        document.getElementById(this.containerID).innerHTML = 'Could not load rental registration.';
    }
}