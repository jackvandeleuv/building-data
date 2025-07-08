import { DEFAULT_BUILDING_IMG } from "../../config.js";
import { ViolationCarosel } from "../carosels/violationCarosel.js";
import { RentalCarosel } from "../carosels/rentalCarosel.js";
import { SameOwnerParcelCarosel } from "../carosels/sameOwnerParcelCarosel.js";
import { URI } from "../../config.js";
import { daysAgoLabel } from "../../utils.js";

export class ComplaintPage {
    // http://localhost:8000/?type=parcel&parcelpin=00234143
    constructor() {       
        const params = new URLSearchParams(window.location.search);
        this.record_id = (params.get("record_id") || '').trim();
        this.parcelpin = (params.get("parcelpin") || '').trim();
        this.owner = (params.get("owner") || '').trim();

        document.getElementById('main').innerHTML = `
            <header class="parcelPageBanner">
                <a href="javascript:history.back()" class="back-btn" aria-label="Go back"><</a>
                <img id="headerImage" src="${DEFAULT_BUILDING_IMG}" alt="">
            </header>            
            <div class="content" id="content"> 
                <p>Loading...</p>
            </div>
            <hr>
            <h3>Parcels With The Same Owner</h3>
            <div id="sameOwnerParcelsCarosel" class="carosel">
                Loading...
            </div>
            <hr>
            <h3>Rental Registrations At This Parcel</h3>
            <div id="rentalCarosel" class="carosel">
                Loading...
            </div>
            <hr>
            <h3>Violations At This Parcel</h3>
            <div id="violationCarosel" class="carosel">
                Loading...
            </div>
        `;

        this.load();
        new SameOwnerParcelCarosel('sameOwnerParcelsCarosel', this.owner);
        new ViolationCarosel('violationCarosel', this.parcelpin);
        new RentalCarosel('rentalCarosel', this.parcelpin);
    }

    async load() {
        const url = `http://localhost:5000/complaint_details/${this.record_id}`;
        const response = await fetch(encodeURI(url));
        const results = await response.json();

        if (results.length === 0) {
            document.getElementById('content').innerHTML = `Could not load complaint.`;
            return;
        }

        const firstRow = results[0];

        if (firstRow.photo_link !== undefined) {
            document.getElementById('headerImage').src = firstRow.photo_link
        }

        const ownerLink = encodeURI(`${URI}?type=owner&owner=${firstRow.deeded_owner_clean}`);

        let cardHTML = '';
        for (const row of results) {
            if (row.task_date === null) {
                continue
            }
            cardHTML = cardHTML + this.makeCard(row)
        }

        document.getElementById('content').innerHTML = `
            <h1>${firstRow.parcelpin}</h1>
            <div class="parcelPageSubHeader">${firstRow.par_addr_all}</div>
            <a 
                href="${ownerLink}"
                class="ownerLink"
            >
                ${firstRow.deeded_owner_main_alias}
            </a>
            <hr>
            <h2>Status History For This Complaint</h2>
            <div>
                ${cardHTML}
            </div>
        `;    
    }

    makeCard(row) {
        const task = row.current_task;

        let color = '';
        if (task === 'Complaint Inspector') {
            color = '#a2f4fd'
        } else if (task === 'Complaint Chief Inspector') {
            color = '#c4b4ff'
        } else if (task === 'Complaint Acceptance') {
            color = '#b9f8cf'
        } else if (task === 'Closure') {
            color = '#ffa1ad'
        } else {
            color = '#a6a09b'
        }

        return `
            <div class="complaintHistoryCard">
                <p>
                    <b style="background-color: ${color}">${row.current_task}</b> 
                </p>
                <p>
                    ${daysAgoLabel(new Date(row.task_date))} &mdash; ${row.current_task_status}
                </p>
            </div>
        `;
    }
}