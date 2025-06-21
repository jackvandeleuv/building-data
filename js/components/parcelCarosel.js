import { FeatureService, FieldContainsStringStatement } from "../fetchEsri.js";

// export class RentalRegistration {
//     constructor() {
//         this.service = new FeatureService(
//             'https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Rental_Registrations/FeatureServer/0/query',
//             ['*'],
//             this.onLoad,
//             [new FieldContainsStringStatement('b1_alt_ID', 'RR16-04962')]
//         );
//     }

//     onLoad = () => {
//         if (!this.service.loaded) console.log('service was not loaded!');
//         document.getElementById('main').innerHTML = this.makeHTML(this.service.data);
//     }

//     makeHTML(data) {
//         return data.map((row) => this.makeCard(row)).join('');
//     }

//     makeCard(data) {
//         return `
//             <div>
//                 <h1>${data.b1_alt_ID}</h1>
//                 <h3>${data.DW_Parcel}</h3>
//                 <h3>${data.AddressFull}</h3>
//                 <ul>
//                     <li>File Date: ${data.FileDate}</li>
//                     <li>Address: ${data.Address}</li>
//                     <li>Address Full: ${data.AddressFull}</li>
//                     <li>Units: ${data.Units}</li>
//                     <li>Status: ${data.Status}</li>
//                     <li>${data.StatusDate}</li>
//                     <li>Owner Name: ${data.OwnerName}</li>
//                     <li>Owner Org Name: ${data.OwnerOrgName}</li>
//                     <li>Owner Address: ${data.OwnerAddress}</li>
//                     <li>${data.AdditionalContactName}</li>
//                     <li>${data.AdditionalContactOrgName}</li>
//                     <li>${data.AdditionalContactRelation}</li>
//                     <li>${data.AdditionalContactAddress}</li>
//                     <li>${data.ACCELA_CITIZEN_ACCESS_URL}</li>
//                 </ul>
//             </div>
//         `;
//     }
// }

class ParcelCarosel {
    // parcelpin, <PARCELPIN>
    constructor(filterStatements, containerID, parentCallback) {
        this.loaded = false;
        this.containerID = containerID;
        this.service = new FeatureService(
            'https://gis.cuyahogacounty.us/server/rest/services/CCFO/EPV_Prod/FeatureServer/2/query',
            [
                'parcelpin',
                'parcel_owner',
                'par_addr_all',
                'last_transfer_date',
                'last_sales_amount',
                'tax_luc_description',
                'prop_class_desc'
            ],
            this.onLoad,
            filterStatements
        );
    }

    onLoad = () => {
        if (!this.service.loaded) return;
        document.getElementById()
        this.makeHTML();
        this.loaded = true;
        
    }

    makeHTML(data) {
        let innerHTML = ''; 
        for (const row of data) {
            const card = new ParcelCaroselCard(row);
            innerHTML = innerHTML + card;
        }

        return `
            <div class="parcelDetails", id="${this.containerID}">
                ${innerHTML}
            </div>
        `;
    }
}

class ParcelCaroselCard {
    constructor(data) {
        this.data = data
    }

    makeHTML() {
        return `
            <li class="carosel-item item">
                <div class="thumb"></div>
                <div class="details">
                    <h3 class="title">${data.parcelpin}</h3>
                    <p class="violation-type">${data.parcel_owner} for ${daysAgoLabel(data.last_transfer_date)}</p>
                    <p class="meta">Status: ${data.par_addr_all} (})</p>
                </div>
                <span class="chevron">›</span>
            </li>
        `;
    }
}