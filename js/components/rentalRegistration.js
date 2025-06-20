import { FeatureService, FieldContainsStringStatement } from "../fetchEsri.js";

export class RentalRegistration {
    constructor() {
        this.service = new FeatureService(
            'https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Rental_Registrations/FeatureServer/0/query',
            ['*'],
            this.onLoad,
            [new FieldContainsStringStatement('DW_Parcel', '93118005')]
        );
    }

    onLoad = () => {
        if (!this.service.loaded) console.log('service was not loaded!');
        document.getElementById('main').innerHTML = this.makeHTML(this.service.data);
    }

    makeHTML(data) {
        return data.map((row) => this.makeCard(row)).join('');
    }

    makeCard(data) {
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
                    <li>${data.ACCELA_CITIZEN_ACCESS_URL}</li>
                </ul>
            </div>
        `;
    }
}