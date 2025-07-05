import { FeatureService } from "../../fetchEsri.js";

export class RentalBody {
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
            'https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Rental_Registrations/FeatureServer/0/query',
            [
                "b1_alt_ID", "DW_Parcel", "AddressFull",
                "FileDate", "Address", "Units",
                "Status", "StatusDate", "OwnerName",
                "OwnerOrgName", "OwnerAddress", "AdditionalContactName",
                "AdditionalContactOrgName", "AdditionalContactRelation", "AdditionalContactAddress"
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
            <h1>${row.b1_alt_ID}</h1>
            <p class="parcelPageSubHeader">${row.DW_Parcel}</p>
            <p class="parcelPageSubHeader">${row.AddressFull}</p>
            <ul>
                <li>File Date: ${row.FileDate}</li>
                <li>Address: ${row.Address}</li>
                <li>Address Full: ${row.AddressFull}</li>
                <li>Units: ${row.Units}</li>
                <li>Status: ${row.Status}</li>
                <li>Status Date: ${row.StatusDate}</li>
                <li>Owner Name: ${row.OwnerName}</li>
                <li>Owner Org Name: ${row.OwnerOrgName}</li>
                <li>Owner Address: ${row.OwnerAddress}</li>
                <li>Additional Contact Name: ${row.AdditionalContactName}</li>
                <li>Additional Contact Org Name: ${row.AdditionalContactOrgName}</li>
                <li>Additional Contact Relation: ${row.AdditionalContactRelation}</li>
                <li>Additional Contact Address: ${row.AdditionalContactAddress}</li>
            </ul>
        `;
    }

    renderEmptyComponent() {
        document.getElementById(this.containerID).innerHTML = 'Could not load rental registration.';
    }
}
