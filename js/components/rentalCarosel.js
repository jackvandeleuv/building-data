import { daysAgoLabel } from '../utils/utils.js';
import { URI } from '../config.js';
import { FeatureService } from '../fetchEsri.js';
import { getParcelImage } from '../utils/utils.js';

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
            await this.renderLoadedComponent()
        } else {
            this.renderEmptyComponent()
        }

        this.__loaded = this.__service.isLoaded();
        this.__loading = false;
    }

    makeLoadedCard(row, i) {
        return `
            <a href="${encodeURI(URI + '?type=rental&record_id=' + row.b1_alt_ID)}">
                <li class="carosel-item item">
                    <img class="thumb" id="rentalCardImage_${i}" src="">
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

    async renderLoadedComponent() {
        let i = 0;
        let innerHTML = '';
        for (const row of this.__service.data) {
            innerHTML = innerHTML + this.makeLoadedCard(row, i++);
        }
        document.getElementById(this.containerID).innerHTML = innerHTML;

        let j = 0;
        for (const row of this.__service.data) {
            await getParcelImage(`rentalCardImage_${j++}`, row.DW_Parcel)
        }
    }
}
