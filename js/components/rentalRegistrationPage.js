import { FeatureService, WhereClause } from "../fetchEsri.js";
import { ParcelCarosel } from "./parcelCarosel.js";

export class RentalRegistrationPage {
    // http://localhost:8000/?type=rental&record_id=RR16-04962
    constructor() {       
        const params = new URLSearchParams(window.location.search);
        this.record_id = params.get("record_id");

        this.rentalService = new FeatureService(
            'https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Rental_Registrations/FeatureServer/0/query',
            ['*'],
            this.render,
            [new WhereClause('b1_alt_ID', this.record_id)]
        );
        this.rentalService.load();
    }

    loadParcelService() {
        const owner = this.rentalService.data[0].OwnerOrgName.trim();
        const parcelServiceDisabled = owner === '';

        console.log(`Parcel service disabled: ${parcelServiceDisabled}`)
        console.log(`Owner: ${owner}`);
        console.log(`Rental service:`)
        console.log(this.rentalService.data)

        const filterStatements = [new WhereClause('parcel_owner', owner)];

        this.parcelService = new FeatureService(
            'https://gis.cuyahogacounty.us/server/rest/services/CCFO/EPV_Prod/FeatureServer/2/query',
            [
                'parcelpin',
                'parcel_owner',
                'last_transfer_date',
                'last_sales_amount',
                'tax_luc_description',
                'prop_class_desc',
                'parcel_addr', 
                'parcel_predir', 
                'parcel_street', 
                'parcel_suffix', 
                'parcel_unit', 
                'parcel_city'
            ],
            this.render,
            filterStatements,
            true,
            parcelServiceDisabled
        );
        this.parcelService.load();
    }

    render = () => {
        if (this.rentalService.isLoaded() && this.parcelService === undefined) {
            this.loadParcelService();    
        }

        const parcelCarosel = new ParcelCarosel(
            'parcelCarosel', 
            this.parcelService ? this.parcelService.data : [],
            this.parcelService ? this.parcelService.isLoaded() : false
        );
        const innerHTML = this.makeHTML() + parcelCarosel.makeHTML();

        document.getElementById('main').innerHTML = innerHTML;
    }

    makeHTML() {
        if (this.rentalService === undefined || !this.rentalService.isLoaded()) {
            return this.makeLoadingRentalCard()
        };
        if (this.rentalService.data.length === 0) {
            return this.makeEmptyRentalCard();
        }
        return this.makeRentalCard(this.rentalService.data[0]);
    }

    makeEmptyRentalCard() {
        return `
            <div>No data found for ${this.rental_id}</div>
        `;
    }

    makeLoadingRentalCard() {
        return `
            <div>Loading...</div>
        `;
    }

    makeRentalCard(data) {
        return `
            <div>
                <h1>${data.b1_alt_ID}</h1>
                <h3>${data.DW_Parcel}</h3>
                <h3>${data.AddressFull}</h3>
                <ul>
                    <li>File Date: ${data.FileDate}</li>
                    <li>Address: ${data.Address}</li>
                    <li>Address Full: ${data.AddressFull}</li>
                    <li>Units: ${data.Units}</li>
                    <li>Status: ${data.Status}</li>
                    <li>${data.StatusDate}</li>
                    <li>Owner Name: ${data.OwnerName}</li>
                    <li>Owner Org Name: ${data.OwnerOrgName}</li>
                    <li>Owner Address: ${data.OwnerAddress}</li>
                    <li>${data.AdditionalContactName}</li>
                    <li>${data.AdditionalContactOrgName}</li>
                    <li>${data.AdditionalContactRelation}</li>
                    <li>${data.AdditionalContactAddress}</li>
                </ul>
            </div>
            <hr>
            <h3>Parcels With The Same Owner</h3>
        `;
    }
}
