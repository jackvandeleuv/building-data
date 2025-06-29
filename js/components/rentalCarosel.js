import { daysAgoLabel } from '../utils/utils.js';
import { URI } from '../config.js';
import { FeatureService } from '../fetchEsri.js';

export class RentalCarosel {
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
            callbackFunction,
            filterStatements
        );
        await this.__service.load();

        if (this.__service.isLoaded() && this.__service.data !== undefined && this.__service.data.length !== 0) {
            this.renderLoadedComponent()
        } else {
            this.renderEmptyComponent()
        }

        this.__loaded = this.__service.isLoaded();
        this.__loading = false;
    }

    makeLoadedCard(row) {
        return `
            <a href="${encodeURI(URI + '?type=rental&record_id=' + row.b1_alt_ID)}">
                <li class="carosel-item item">
                    <div class="thumb"></div>
                    <div class="details">
                        <h4 class="title">
                            ${row.Status}
                        </h4>
                        <p class="violation-type">
                            ${row.b1_alt_ID}
                        </p>
                        <p class="meta">
                            ${row.OwnerOrgName}
                        </p>
                        <p class="meta">
                            Last update ${daysAgoLabel(row.StatusDate)}
                        </p>
                    </div>
                    <span class="chevron">›</span>
                </li>
            </a>
        `;
    }

    renderEmptyComponent() {
        document.getElementById(this.containerID).innerHTML = 'No rental registrations found.';
    }

    renderLoadedComponent() {
        console.log('rendering loaded rental carosel')
        console.log(this.__service.data)
        let innerHTML = '';
        for (const row of this.__service.data) {
            innerHTML = innerHTML + this.makeLoadedCard(row);
        }
        document.getElementById(this.containerID).innerHTML = innerHTML;
    }
}
