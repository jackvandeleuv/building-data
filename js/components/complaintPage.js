import { FeatureService, WhereClause } from "../fetchEsri.js";
import { ComplaintCarosel } from "./complaintCarosel.js";
import { ParcelCarosel } from "./parcelCarosel.js";
import { ViolationCarosel } from "./violationCarosel.js";

export class ComplaintPage {
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

    getRentalField(field) {
        if (
            this.rentalService.data === undefined ||
            this.rentalService.data.length === 0 ||
            this.rentalService.data[0][field] === undefined ||
            this.rentalService.data[0][field] === ''
        ) {
            return '';
        }
        return this.rentalService.data[0][field].trim();
    }

    loadComplaints() {
        if (this.complaintService !== undefined) return;

        const dw_parcel = this.getRentalField('DW_Parcel');
        const serviceDisabled = dw_parcel === '';
        const filterStatements = [new WhereClause('DW_Parcel', dw_parcel)];

        this.complaintService = new FeatureService(
            'https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Complaint_Status_History/FeatureServer/0/query',
            [
                'PERMIT_ID', 'FILE_DATE', 'SOURCE',
                'CURRENT_TASK', 'CURRENT_TASK_STATUS', 'TASK_DATE',
                'TYPE_OF_COMPLAINT'
            ],
            this.render,
            filterStatements,
            false,
            serviceDisabled
        );
        this.complaintService.load();
    }

    loadViolations() {
        if (this.violationService !== undefined) return;

        const dw_parcel = this.getRentalField('DW_Parcel');
        const serviceDisabled = dw_parcel === '';
        const filterStatements = [new WhereClause('DW_Parcel', dw_parcel)];

        this.violationService = new FeatureService(
            'https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Violation_Status_History/FeatureServer/0/query',
            [
                'RECORD_ID', 'FILE_DATE', 'PRIMARY_ADDRESS',
                'TASK_NAME', 'TASK_STATUS', 'TASK_SEQUENCE_NUMBER',
                'TYPE_OF_VIOLATION', 'OCCUPANCY_OR_USE', 'ISSUE_DATE',
                'ACCELA_CITIZEN_ACCESS_URL', 'DW_Parcel'
            ],
            this.render,
            filterStatements,
            false,
            serviceDisabled
        );
                
        this.violationService.load();
    }

    loadParcelService() {
        if (this.parcelService !== undefined) return;

        const owner = this.getRentalField('OwnerOrgName');
        const serviceDisabled = owner === '';
        const filterStatements = [new WhereClause('parcel_owner', owner)];

        this.parcelService = new FeatureService(
            'https://gis.cuyahogacounty.us/server/rest/services/CCFO/EPV_Prod/FeatureServer/2/query',
            [
                'parcelpin', 'parcel_owner', 'last_transfer_date',
                'last_sales_amount', 'tax_luc_description', 'prop_class_desc',
                'parcel_addr', 'parcel_predir', 'parcel_street', 
                'parcel_suffix', 'parcel_unit', 'parcel_city'
            ],
            this.render,
            filterStatements,
            true,
            serviceDisabled
        );
        this.parcelService.load();
    }

    render = () => {
        if (this.rentalService.isLoaded()) {
            this.loadParcelService();   
            this.loadComplaints(); 
            this.loadViolations();   
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
            <header class="parcelPageBanner">
                <a href="javascript:history.back()" class="back-btn" aria-label="Go back"><</a>
                <img id="parcelPageImage" src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Archean.png/1024px-Archean.png" alt="">
            </header>

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
            <header class="parcelPageBanner">
                <a href="javascript:history.back()" class="back-btn" aria-label="Go back"><</a>
                <img id="parcelPageImage" src="" alt="">
            </header>

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
            <header class="parcelPageBanner">
                <a href="javascript:history.back()" class="back-btn" aria-label="Go back"><</a>
                <img id="parcelPageImage" src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Archean.png/1024px-Archean.png" alt="">
            </header>

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
