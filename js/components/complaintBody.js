import { FeatureService } from "../fetchEsri.js";

export class ComplaintBody {
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
            (() => {}),
            filterStatements,
        );
        await this.__service.load();

        if (this.__service.isLoaded()) {
            this.renderLoadedComponent()
        } else {
            this.renderEmptyComponent()
        }

        if (this.__service.data === undefined || this.__service.data.length === 0) {
            console.log('complaintBody load fail!');
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
        
        document.getElementById('content').innerHTML = `
            <h1>${row.PERMIT_ID}</h1>
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
        document.getElementById(this.containerID).innerHTML = 'Could not load complaint.';
    }
}
