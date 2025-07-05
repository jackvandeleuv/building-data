import { WhereClause } from "../../fetchEsri.js";
import { ComplaintCarosel } from "../complaint/complaintCarosel.js";
import { ViolationCarosel } from "../violation/violationCarosel.js";
import { RentalBody } from "./rentalBody.js";
import { getParcelImage } from "../../utils/utils.js";
import { DEFAULT_BUILDING_IMG } from "../../config.js";

export class RentalPage {
    // http://localhost:8000/?type=rental&record_id=RR16-04962
    constructor() {       
        document.getElementById('main').innerHTML = `
            <header class="parcelPageBanner">
                <a href="javascript:history.back()" class="back-btn" aria-label="Go back"><</a>
                <img id="headerImage" src="${DEFAULT_BUILDING_IMG}" alt="">
            </header>            
            <div class="content" id="content"> 
                <p>Loading...</p>
            </div>
            <hr>
            <h3>Complaints About This Parcel</h3>
            <div id="complaintCarosel" class="carosel">
                Loading...
            </div>
            <hr>
            <h3>Violations At This Parcel</h3>
            <div id="violationCarosel" class="carosel">
                Loading...
            </div>
        `;

        const params = new URLSearchParams(window.location.search);
        this.record_id = params.get("record_id");

        const filterStatements = [new WhereClause('b1_alt_ID', this.record_id)];

        this.__rentalBody = new RentalBody('content');

        this.__complaintCarosel = new ComplaintCarosel('complaintCarosel');
        this.__violationCarosel = new ViolationCarosel('violationCarosel');

        this.__rentalBody.load(this.renderCarosels, filterStatements);
    }

    renderCarosels = () => {
        if (!this.__rentalBody.isLoaded()) {
            console.error('Could not load complaint.');
            return;
        }
        
        const parcel = this.__rentalBody.parcel;

        getParcelImage('headerImage', parcel);
        this.__complaintCarosel.load(() => {}, [new WhereClause('DW_Parcel', parcel)]);
        this.__violationCarosel.load(() => {}, [new WhereClause('DW_Parcel', parcel)]);
    }
}