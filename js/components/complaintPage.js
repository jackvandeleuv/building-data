import { FeatureService, WhereClause } from "../fetchEsri.js";
import { RentalCarosel } from "./rentalCarosel.js";
import { ParcelCarosel } from "./parcelCarosel.js";
import { ViolationCarosel } from "./violationCarosel.js";
import { ComplaintBody } from "./complaintBody.js";

export class ComplaintPage {
    // http://localhost:8000/?type=complaint&record_id=
    constructor() {       
        document.getElementById('main').innerHTML = `
            <header class="parcelPageBanner">
                <a href="javascript:history.back()" class="back-btn" aria-label="Go back"><</a>
                <img id="parcelPageImage" src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Archean.png/1024px-Archean.png" alt="">
            </header>            
            <div class="content" id="content"> 
                <p>Loading...</p>
            </div>
            <hr>
            <h3>Parcels With The Same Owner</h3>
            <div id="parcelCarosel"></div>
            <hr>
            <h3>Complaints About This Parcel</h3>
            <div id="rentalCarosel"></div>
            <hr>
            <h3>Violations About This Parcel</h3>
            <div id="violationCarosel"></div>
        `;

        const params = new URLSearchParams(window.location.search);
        this.record_id = params.get("record_id");

        const filterStatements = [new WhereClause('PERMIT_ID', this.record_id)];

        this.__complaintBody = new ComplaintBody('content');

        this.__parcelCarosel = new ParcelCarosel('parcelCarosel');
        this.__rentalCarosel = new RentalCarosel('rentalCarosel');
        this.__violationCarosel = new ViolationCarosel('violationCarosel');

        this.__complaintBody.load(this.__renderCarosels, filterStatements);
    }

    __renderCarosels = () => {
        if (this.__complaintBody.isLoaded()) {
            console.error('Could not load complaint.');
            return;
        }
        
        const parcel = this.__complaintBody.parcel;
        const owner = this.__complaintBody.owner;

        this.__parcelCarosel.load(() => {}, [new WhereClause('parcel_owner', owner)]);
        this.__rentalCarosel.load(() => {}, [new WhereClause('DW_Parcel', parcel)]);
        this.__violationCarosel.load(() => {}, [new WhereClause('DW_Parcel', parcel)]);
    }
}
