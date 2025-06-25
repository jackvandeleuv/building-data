import { FeatureService, WhereClause } from "../fetchEsri.js";
import { RentalCarosel } from "./rentalCarosel.js";
import { ParcelCarosel } from "./parcelCarosel.js";
import { loadRentals, loadComplaints, loadSameOwnerParcels, loadViolations } from "../utils/utils.js";
import { ComplaintCarosel } from "./complaintCarosel.js";
import { ViolationCarosel } from "./violationCarosel.js";

export class ParcelPage {
    // http://localhost:8000/?type=complaint&record_id=
    constructor() {       
        const params = new URLSearchParams(window.location.search);
        this.parcelpin = params.get("parcelpin");

        const filterStatements = [new WhereClause('survey_parcel', this.parcelpin)];

        this.surveyService = new FeatureService(
            'https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Citywide_Property_Survey_2022/FeatureServer/0/query',
            [
                'survey_address', 'survey_parcel', 'survey_created',
                'survey_property_cat', 'survey_property_use', 'survey_grade',
                'survey_condition_garage', 'survey_condition_windows', 'survey_condition_roof',
                'survey_condition_siding', 'survey_condition_porch', 'survey_condition_gutters',
                'survey_condition_chimney', 'survey_condition_driveway', 'survey_condition_lawn',
                'survey_vacantcondition', 'survey_sourceofdistress', 'survey_improvement',
                'survey_improvement_explained', 'survey_LeadPlacard', 'survey_paintpeeling',
                'survey_paintpeeling_location', 'survey_bareSoil', 'survey_sidewalk_existing',
                'survey_sidewalk_material', 'survey_sidewalk_condition', 'survey_CityTreeObstruction',
                'survey_treelawn_existing', 'survey_PlantObstruction', 'survey_dumping_existing',
                'survey_dumping_OnTreeLawn', 'survey_vehicle_OnTreeLawn', 'survey_InoperableVehicle',
                'survey_InoperableVehicle_locati', 'survey_RVparked', 'survey_RVparked_location',
                'survey_OpenToTrespassing', 'survey_signof_SaleOrRent', 'survey_trees',
                'survey_treesWidth', 'survey_curb', 'survey_curb_material',
                'survey_curb_condition', 'survey_curbreveal_condition', 'survey_streetcondition',
                'survey_FireHydrant_existing', 'survey_FireHydrant_condition', 'survey_FireHydrant_poordetail',
                'survey_ADAramp', 'survey_ADAramp_receiving', 'survey_truncatedDome_existing',
                'survey_truncateDome_detail', 'survey_ImmediateInspection', 'survey_notes',
                'survey_picture_status', 'survey_image_1', 'owner'
            ],
            this.render,
            filterStatements
        );
        this.surveyService.load();

        this.render();
    }

    render = () => {
        if (this.surveyService.isLoaded()) {
            this.parcelService = loadSameOwnerParcels(this.parcelService, this.surveyService, this.render, 'owner', 'parcel_owner');   
            this.rentalService = loadRentals(this.rentalService, this.surveyService, this.render, 'survey_parcel', 'DW_Parcel'); 
            this.complaintService = loadComplaints(this.complaintService, this.surveyService, this.render, 'survey_parcel', 'DW_Parcel'); 
            this.violationService = loadViolations(this.violationService, this.surveyService, this.render, 'survey_parcel', 'DW_Parcel');       
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
                    complaintCarosel.makeHTML(),
                    violationCarosel.makeHTML()
                )}
            </div>
        `;

        document.getElementById('main').innerHTML = innerHTML;
    }

    makeHTML(parcelCarosel, rentalCarosel, complaintCarosel, violationCarosel) {
        if (this.surveyService === undefined || !this.surveyService.isLoaded()) {
            return this.makeLoadingCard(
                parcelCarosel, 
                rentalCarosel, 
                complaintCarosel,
                violationCarosel
            )
        }
        if (this.surveyService.data.length === 0) {
            return this.makeEmptyCard(
                parcelCarosel, 
                rentalCarosel, 
                complaintCarosel,
                violationCarosel
            )
        }
        return this.makeCard(
            this.surveyService.data[0],
            parcelCarosel,
            rentalCarosel,
            complaintCarosel,
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

    makeEmptyCard(parcelCarosel, rentalCarosel, complaintCarosel, violationCarosel) {
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
            <hr>
            <h3>Violations At This Parcel</h3>
            ${violationCarosel}
        `;
    }

    makeLoadingCard(parcelCarosel, rentalCarosel, complaintCarosel, violationCarosel) {
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
            <h3>Violations At This Parcel</h3>
            ${violationCarosel}
        `;
    }

    makeCard(data, parcelCarosel, rentalCarosel, complaintCarosel, violationCarosel) {
        return `
            ${this.makeImageBannerHTML()}
            <div class="content" id="content">
                <h1>${data.survey_address}</h1>
                <p class="parcelPageSubHeader">${data.survey_parcel}</p>
                <ul>
                    <li>CURRENT_TASK: ${data.survey_created}</li>
                    <li>CURRENT_TASK_STATUS: ${data.survey_property_cat}</li>
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
            <hr>
            <h3>Violations On This Parcel</h3>
            ${violationCarosel}
        `;
    }
}
