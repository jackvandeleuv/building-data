import { daysAgoLabel } from '../utils/utils.js';
import { URI } from '../config.js';
import { FeatureService } from '../fetchEsri.js';

export class ParcelCarosel {
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
            'https://gis.cuyahogacounty.us/server/rest/services/CCFO/EPV_Prod/FeatureServer/2/query',
            [
                'parcelpin', 'parcel_owner', 'last_transfer_date',
                'last_sales_amount', 'tax_luc_description', 'prop_class_desc',
                'parcel_addr', 'parcel_predir', 'parcel_street', 
                'parcel_suffix', 'parcel_unit', 'parcel_city'
            ],
            callbackFunction,
            filterStatements,
            true
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

    makeAddressString(data) {
        if (data === undefined || data.length === 0) return '';

        let addressString = [
            data.parcel_addr || '',
            data.parcel_predir || '',
            data.parcel_street || '',
            data.parcel_suffix || '',
            data.parcel_unit || ''
        ].map((elem) => elem.trim()).join(' ').trim();

        // if (this.data.parcel_city !== undefined) {
        //     addressString = addressString + `, ${this.data.parcel_city}`;
        // }

        return addressString;
    }

    makeLoadedCard(row) {
        const addressString = this.makeAddressString(this.__service.data);

        return `
            <a href="${encodeURI(URI + '?type=parcel&parcelpin=' + row.parcelpin)}">
                <li class="carosel-item item">
                    <div class="thumb"></div>
                    <div class="details">
                        <h4 class="title">
                            ${addressString}
                        </h4>
                        <p class="violation-type">
                            ${row.parcelpin}
                        </p>
                        <p class="meta">
                            ${row.parcel_owner}
                        </p>
                        <p class="meta">
                            Transfered ${daysAgoLabel(row.last_transfer_date)}
                        </p>
                    </div>
                    <span class="chevron">›</span>
                </li>
            </a>
        `;
    }

    renderEmptyComponent() {
        document.getElementById(this.containerID).innerHTML = 'No parcels found.';
    }

    renderLoadedComponent() {
        let innerHTML = '';
        for (const row of this.__service.data) {
            innerHTML = innerHTML + this.makeLoadedCard(row);
        }
        document.getElementById(this.containerID).innerHTML = innerHTML;
    }
}
