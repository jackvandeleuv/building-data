import { FeatureService, WhereClause } from "../fetchEsri.js";
import { RentalCarosel } from "./rentalCarosel.js";
import { ParcelCarosel } from "./parcelCarosel.js";
import { ViolationCarosel } from "./violationCarosel.js";
import { loadRentals, loadViolations, loadSameOwnerParcels } from "../utils/utils.js";

export class ComplaintPage {
    // http://localhost:8000/?type=complaint&record_id=
    constructor() {       
        const params = new URLSearchParams(window.location.search);
        this.record_id = params.get("record_id");

        const filterStatements = [new WhereClause('PERMIT_ID', this.record_id)];

        this.complaintService = new FeatureService(
            'https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Complaint_Status_History/FeatureServer/0/query',
            [
                'PERMIT_ID', 'FILE_DATE', 'SOURCE',
                'CURRENT_TASK', 'CURRENT_TASK_STATUS', 'TASK_DATE',
                'TYPE_OF_COMPLAINT', 'DW_Parcel'
            ],
            this.render,
            filterStatements,
        );
        this.complaintService.load();
    }

    render = () => {
        if (this.complaintService.isLoaded()) {
            this.parcelService = loadSameOwnerParcels(this.parcelService, this.complaintService, this.render, 'OwnerOrgName', 'parcel_owner');   
            this.rentalService = loadRentals(this.rentalService, this.complaintService, this.render, 'DW_Parcel', 'DW_Parcel'); 
            this.violationService = loadViolations(this.violationService, this.complaintService, this.render, 'DW_Parcel', 'DW_Parcel');   
        }

        const parcelCarosel = new ParcelCarosel(
            'parcelCarosel', 
            this.parcelService !== undefined ? this.parcelService.data : [],
            this.parcelService !== undefined ? this.parcelService.isLoaded() : false
        );

        const rentalCarosel = new RentalCarosel(
            'rentalCarosel', 
            this.rentalService !== undefined ? this.rentalService.data : [],
            this.rentalService !== undefined ? this.rentalService.isLoaded() : false
        );

        const violationCarosel = new ViolationCarosel(
            'violationCarosel', 
            this.violationService !== undefined ? this.violationService.data : [],
            this.violationService !== undefined ? this.violationService.isLoaded() : false
        );

        const innerHTML = `
            <div class="content">
                ${this.makeHTML(
                    parcelCarosel.makeHTML(),
                    rentalCarosel.makeHTML(),
                    violationCarosel.makeHTML()
                )}
            </div>
        `;

        document.getElementById('main').innerHTML = innerHTML;
    }

    makeHTML(parcelCarosel, rentalCarosel, violationCarosel) {
        if (this.complaintService === undefined || !this.complaintService.isLoaded()) {
            return this.makeLoadingCard(
                parcelCarosel, 
                rentalCarosel, 
                violationCarosel
            )
        }
        if (this.complaintService.data.length === 0) {
            return this.makeEmptyCard(
                parcelCarosel, 
                rentalCarosel, 
                violationCarosel
            )
        }
        return this.makeCard(
            this.complaintService.data[0],
            parcelCarosel,
            rentalCarosel,
            violationCarosel
        )
    }

    makeImageBannerHTML() {
        return `
            <header class="parcelPageBanner">
                <a href="javascript:history.back()" class="back-btn" aria-label="Go back"><</a>
                <img id="parcelPageImage" src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Archean.png/1024px-Archean.png" alt="">
            </header>
        `;
    }

    makeEmptyCard(parcelCarosel, rentalCarosel, violationCarosel) {
        return `
            ${this.makeImageBannerHTML()}
            <div class="content" id="content">
                <p>No data found for ${this.rental_id}</p>
            </div>
            <hr>
            <h3>Parcels With The Same Owner</h3>
            ${parcelCarosel}
            <hr>
            <h3>Complaints About This Parcel</h3>
            ${rentalCarosel}
            <hr>
            <h3>Violations About This Parcel</h3>
            ${violationCarosel}
        `;
    }

    makeLoadingCard(parcelCarosel, rentalCarosel, violationCarosel) {
        return `
            ${this.makeImageBannerHTML()}
            <div class="content" id="content"> 
                <p>Loading...</p>
            </div>
            <hr>
            <h3>Parcels With The Same Owner</h3>
            ${parcelCarosel}
            <hr>
            <h3>Complaints About This Parcel</h3>
            ${rentalCarosel}
            <hr>
            <h3>Violations At This Parcel</h3>
            ${violationCarosel}
        `;
    }

    makeCard(data, parcelCarosel, rentalCarosel, violationCarosel) {
        console.log('making card with:')
        console.log(data)
        return `
            ${this.makeImageBannerHTML()}
            <div class="content" id="content">
                <h1>${data.PERMIT_ID}</h1>
                <p class="parcelPageSubHeader">${data.DW_Parcel}</p>
                <ul>
                    <li>CURRENT_TASK: ${data.CURRENT_TASK}</li>
                    <li>CURRENT_TASK_STATUS: ${data.CURRENT_TASK_STATUS}</li>
                    <li>FILE_DATE: ${data.FILE_DATE}</li>
                    <li>SOURCE: ${data.SOURCE}</li>
                    <li>TASK_DATE: ${data.TASK_DATE}</li>
                    <li>TYPE_OF_COMPLAINT: ${data.TYPE_OF_COMPLAINT}</li>
                </ul>
            </div>
            <hr>
            <h3>Parcels With The Same Owner</h3>
            ${parcelCarosel}
            <hr>
            <h3>Rental Registrations At This Parcel</h3>
            ${rentalCarosel}
            <hr>
            <h3>Violations At This Parcel</h3>
            ${violationCarosel}
        `;
    }
}
