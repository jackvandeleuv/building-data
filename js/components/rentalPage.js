import { FeatureService, WhereClause } from "../fetchEsri.js";
import { ComplaintCarosel } from "./complaintCarosel.js";
import { ParcelCarosel } from "./parcelCarosel.js";
import { ViolationCarosel } from "./violationCarosel.js";
import { loadSameOwnerParcels, loadViolations, loadComplaints } from "../utils/utils.js";

export class RentalPage {
    // http://localhost:8000/?type=rental&record_id=RR16-04962
    constructor() {       
        const params = new URLSearchParams(window.location.search);
        this.record_id = params.get("record_id");

        this.rentalService = new FeatureService(
            'https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Rental_Registrations/FeatureServer/0/query',
            [
                "b1_alt_ID", "DW_Parcel", "AddressFull",
                "FileDate", "Address", "Units",
                "Status", "StatusDate", "OwnerName",
                "OwnerOrgName", "OwnerAddress", "AdditionalContactName",
                "AdditionalContactOrgName", "AdditionalContactRelation", "AdditionalContactAddress"
            ],
            this.render,
            [new WhereClause('b1_alt_ID', this.record_id)]
        );
        this.rentalService.load();
    }

    render = () => {
        if (this.rentalService.isLoaded()) {
            this.parcelService = loadSameOwnerParcels(this.parcelService, this.rentalService, this.render, 'OwnerOrgName', 'parcel_owner');   
            this.complaintService = loadComplaints(this.complaintService, this.rentalService, this.render, 'DW_Parcel', 'DW_Parcel'); 
            this.violationService = loadViolations(this.violationService, this.rentalService, this.render, 'DW_Parcel', 'DW_Parcel');   
        }

        const parcelCarosel = new ParcelCarosel(
            'parcelCarosel', 
            this.parcelService !== undefined ? this.parcelService.data : [],
            this.parcelService !== undefined ? this.parcelService.isLoaded() : false
        );

        const complaintCarosel = new ComplaintCarosel(
            'complaintCarosel', 
            this.complaintService !== undefined ? this.complaintService.data : [],
            this.complaintService !== undefined ? this.complaintService.isLoaded() : false
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
                    complaintCarosel.makeHTML(),
                    violationCarosel.makeHTML()
                )}
            </div>
        `;

        document.getElementById('main').innerHTML = innerHTML;
    }

    makeImageBannerHTML() {
        return `
            <header class="parcelPageBanner">
                <a href="javascript:history.back()" class="back-btn" aria-label="Go back"><</a>
                <img id="parcelPageImage" src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Archean.png/1024px-Archean.png" alt="">
            </header>
        `;
    }

    makeHTML(parcelCarosel, complaintCarosel, violationCarosel) {
        if (this.rentalService === undefined || !this.rentalService.isLoaded()) {
            return this.makeLoadingRentalCard(
                parcelCarosel, 
                complaintCarosel, 
                violationCarosel
            )
        }
        if (this.rentalService.data.length === 0) {
            return this.makeEmptyRentalCard(
                parcelCarosel, 
                complaintCarosel, 
                violationCarosel
            )
        }
        return this.makeRentalCard(
            this.rentalService.data[0],
            parcelCarosel,
            complaintCarosel,
            violationCarosel
        )
    }

    makeEmptyRentalCard(parcelCarosel, complaintCarosel, violationCarosel) {
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
            ${complaintCarosel}
            <hr>
            <h3>Violations About This Parcel</h3>
            ${violationCarosel}
        `;
    }

    makeLoadingRentalCard(parcelCarosel, complaintCarosel, violationCarosel) {
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
            ${complaintCarosel}
            <hr>
            <h3>Violations At This Parcel</h3>
            ${violationCarosel}
        `;
    }

    makeRentalCard(data, parcelCarosel, complaintCarosel, violationCarosel) {
        return `
            ${this.makeImageBannerHTML()}
            <div class="content" id="content">
                <h1>${data.b1_alt_ID}</h1>
                <p class="parcelPageSubHeader">${data.DW_Parcel}</p>
                <p class="parcelPageSubHeader">${data.AddressFull}</p>
                <ul>
                    <li>File Date: ${data.FileDate}</li>
                    <li>Address: ${data.Address}</li>
                    <li>Address Full: ${data.AddressFull}</li>
                    <li>Units: ${data.Units}</li>
                    <li>Status: ${data.Status}</li>
                    <li>Status Date: ${data.StatusDate}</li>
                    <li>Owner Name: ${data.OwnerName}</li>
                    <li>Owner Org Name: ${data.OwnerOrgName}</li>
                    <li>Owner Address: ${data.OwnerAddress}</li>
                    <li>Additional Contact Name: ${data.AdditionalContactName}</li>
                    <li>Additional Contact Org Name: ${data.AdditionalContactOrgName}</li>
                    <li>Additional Contact Relation: ${data.AdditionalContactRelation}</li>
                    <li>Additional Contact Address: ${data.AdditionalContactAddress}</li>
                </ul>
            </div>
            <hr>
            <h3>Parcels With The Same Owner</h3>
            ${parcelCarosel}
            <hr>
            <h3>Complaints About This Parcel</h3>
            ${complaintCarosel}
            <hr>
            <h3>Violations At This Parcel</h3>
            ${violationCarosel}
        `;
    }
}
