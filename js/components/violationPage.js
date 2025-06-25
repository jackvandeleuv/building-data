import { FeatureService, WhereClause } from "../fetchEsri.js";
import { RentalCarosel } from "./rentalCarosel.js";
import { ParcelCarosel } from "./parcelCarosel.js";
import { loadRentals, loadComplaints, loadSameOwnerParcels } from "../utils/utils.js";
import { ComplaintCarosel } from "./complaintCarosel.js";

export class ViolationPage {
    // http://localhost:8000/?type=complaint&record_id=
    constructor() {       
        const params = new URLSearchParams(window.location.search);
        this.record_id = params.get("record_id");

        const filterStatements = [new WhereClause('RECORD_ID', this.record_id)];

        this.violationService = new FeatureService(
            'https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Violation_Status_History/FeatureServer/0/query',
            [
                'RECORD_ID', 'FILE_DATE', 'PRIMARY_ADDRESS',
                'TASK_NAME', 'TASK_STATUS', 'TASK_SEQUENCE_NUMBER',
                'TYPE_OF_VIOLATION', 'OCCUPANCY_OR_USE', 'ISSUE_DATE',
                'ACCELA_CITIZEN_ACCESS_URL', 'DW_Parcel', 'TASK_DATE'
            ],
            this.render,
            filterStatements
        );
        this.violationService.load();
    }

    render = () => {
        if (this.violationService.isLoaded()) {
            this.parcelService = loadSameOwnerParcels(this.parcelService, this.violationService, this.render, 'OwnerOrgName', 'parcel_owner');   
            this.rentalService = loadRentals(this.rentalService, this.violationService, this.render, 'DW_Parcel', 'DW_Parcel'); 
            this.complaintService = loadComplaints(this.complaintService, this.violationService, this.render, 'DW_Parcel', 'DW_Parcel'); 
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

        const complaintCarosel = new ComplaintCarosel(
            'complaintCarosel', 
            this.complaintService !== undefined ? this.complaintService.data : [],
            this.complaintService !== undefined ? this.complaintService.isLoaded() : false
        );

        const innerHTML = `
            <div class="content">
                ${this.makeHTML(
                    parcelCarosel.makeHTML(),
                    rentalCarosel.makeHTML(),
                    complaintCarosel.makeHTML()
                )}
            </div>
        `;

        document.getElementById('main').innerHTML = innerHTML;
    }

    makeHTML(parcelCarosel, rentalCarosel, complaintCarosel) {
        if (this.violationService === undefined || !this.violationService.isLoaded()) {
            return this.makeLoadingCard(
                parcelCarosel, 
                rentalCarosel, 
                complaintCarosel
            )
        }
        if (this.violationService.data.length === 0) {
            return this.makeEmptyCard(
                parcelCarosel, 
                rentalCarosel, 
                complaintCarosel
            )
        }
        return this.makeCard(
            this.violationService.data[0],
            parcelCarosel,
            rentalCarosel,
            complaintCarosel
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

    makeEmptyCard(parcelCarosel, rentalCarosel, complaintCarosel) {
        return `
            ${this.makeImageBannerHTML()}
            <div class="content" id="content">
                <p>No data found for ${this.rental_id}</p>
            </div>
            <hr>
            <h3>Parcels With The Same Owner</h3>
            ${parcelCarosel}
            <hr>
            <h3>Rental Registrations At This Parcel</h3>
            ${rentalCarosel}
            <hr>
            <h3>Complaints About This Parcel</h3>
            ${complaintCarosel}
        `;
    }

    makeLoadingCard(parcelCarosel, rentalCarosel, complaintCarosel) {
        return `
            ${this.makeImageBannerHTML()}
            <div class="content" id="content"> 
                <p>Loading...</p>
            </div>
            <hr>
            <h3>Parcels With The Same Owner</h3>
            ${parcelCarosel}
            <hr>
            <h3>Rental Registrations At Parcel</h3>
            ${rentalCarosel}
            <hr>
            <h3>Complaints About This Parcel</h3>
            ${complaintCarosel}
        `;
    }

    makeCard(data, parcelCarosel, rentalCarosel, complaintCarosel) {
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
            <h3>Complaints About This Parcel</h3>
            ${complaintCarosel}
        `;
    }
}
