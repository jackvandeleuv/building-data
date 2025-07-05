import { WhereClause, FeatureService } from "../../fetchEsri.js";
import { URI } from "../../config.js";
import { daysAgoLabel } from "../../utils/utils.js";

export class SearchPage {
    // http://localhost:8000/
    constructor() {  
        const params = new URLSearchParams(window.location.search);
        this.query = (params.get("q") || '').trim();

        document.getElementById('main').innerHTML = `
            <header class="page-header">
                <h1>Access Building Data</h1>
                <p class="subtitle">Find building and housing data on Cleveland properties</p>
            </header>

            <div class="searchPageMainBox">
                <div class="searchbox">
                    <input 
                        type="text" 
                        role="combobox" 
                        placeholder="Address, parcel ID, or record ID"
                        value="" 
                        id="searchElem"
                    >
                </div>
                <h3 id="resultBoxHeader"></h3>
                <div class="resultBox" id="resultBox">
                    ${this.query === null ? '' : '<progress id="progressBar" max="5" value="0"></progress>'}
                </div>
            </div>
        `;

        document.getElementById('searchElem').addEventListener('keydown', (async (e) => {
            if (e.key !== 'Enter') return;
            window.location = encodeURI(`${URI}?type=search&q=${e.currentTarget.value}`);
        }));

        if (this.query === null) return;

        document.getElementById('searchElem').value = this.query;

        this.__surveyParcels = new FeatureService(
            'https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Citywide_Property_Survey_2022/FeatureServer/0/query',
            [
                'survey_address', 'survey_image_1', 'survey_grade',
                'survey_parcel', 'survey_property_use'
            ],
            this.secondaryLoad,
            [
                new WhereClause('survey_parcel', this.query),
                new WhereClause('survey_address', this.query)
            ],
        );
        this.__surveyParcels.load();

        this.__complaintService = new FeatureService(
            'https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Complaint_Status_History/FeatureServer/0/query',
            [
                'PERMIT_ID', 'FILE_DATE', 'SOURCE',
                'CURRENT_TASK', 'CURRENT_TASK_STATUS', 'TASK_DATE',
                'TYPE_OF_COMPLAINT', 'DW_Parcel', 'PRIMARY_ADDRESS'
            ],
            this.secondaryLoad,
            [
                new WhereClause('PERMIT_ID', this.query)
            ],
        );
        this.__complaintService.load();

        this.__rentalService = new FeatureService(
            'https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Rental_Registrations/FeatureServer/0/query',
            [
                "b1_alt_ID", "DW_Parcel", "AddressFull",
                "FileDate", "Address", "Units",
                "Status", "StatusDate", "OwnerName",
                "OwnerOrgName", "OwnerAddress", "AdditionalContactName",
                "AdditionalContactOrgName", "AdditionalContactRelation", "AdditionalContactAddress"
            ],
            this.secondaryLoad,
            [
                new WhereClause('b1_alt_ID', this.query)
            ]
        );
        this.__rentalService.load();

        this.__violationService = new FeatureService(
            'https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Violation_Status_History/FeatureServer/0/query',
            [
                'RECORD_ID', 'FILE_DATE', 'PRIMARY_ADDRESS',
                'TASK_NAME', 'TASK_STATUS', 'TASK_SEQUENCE_NUMBER',
                'TYPE_OF_VIOLATION', 'OCCUPANCY_OR_USE', 'ISSUE_DATE',
                'ACCELA_CITIZEN_ACCESS_URL', 'DW_Parcel', 'TASK_DATE'
            ],
            this.secondaryLoad,
            [
                new WhereClause('RECORD_ID', this.query)
            ]
        );
        this.__violationService.load();

        this.__geocodedParcels = new GeocodeService();
        this.__geocodedParcels.load(this.query);
    }

    secondaryLoad = async () => { 
        // Currently loading on empty query in order to warm
        // up feature services.
        if (this.query === '') return;

        const loadedServices = (
            Number(this.__surveyParcels.isLoaded()) +
            Number(this.__complaintService.isLoaded()) +
            Number(this.__violationService.isLoaded()) +
            Number(this.__rentalService.isLoaded()) +
            Number(this.__geocodedParcels.isLoaded())
        );

        if (loadedServices < 5) {
            document.getElementById('progressBar').value = loadedServices;
            return;
        }

        const results = this.queueResults();

        if (results.length === 0) {
            document.getElementById('resultBox').innerHTML = '<h3>No results.</h3>';
            return;
        }

        let innerHTML = '';
        let i = 0;
        for (const row of results) {
            let card = {};
            console.log(row)
            if (row.type === 'surveyParcel') {
                card = new SurveyParcelCard(row.data, i++);
            } else if (row.type === 'geocodedParcel') {
                card = new GeocodedParcelCard(row.data, i++);
            } else if (row.type === 'violation') {
                card = new ViolationCard(row.data, i++);
            } else if (row.type === 'complaint') {
                card = new ComplaintCard(row.data, i++);
            } else if (row.type === 'rental') {
                card = new RentalCard(row.data, i++);
            } else {
                continue
            }
            innerHTML = innerHTML + card.makeHTML();
        }

        document.getElementById('resultBox').innerHTML = innerHTML;
    }

    queueResults() {
        const violations = [...this.__violationService.data];
        const complaints = [...this.__complaintService.data];
        const rentals = [...this.__rentalService.data];
        const geocodedParcels = [...this.__geocodedParcels.data];
        const surveyParcels = [...this.__surveyParcels.data];

        const results = [];
        while (
            violations.length > 0 || 
            complaints.length > 0 || 
            rentals.length > 0 ||
            surveyParcels.length > 0 ||
            geocodedParcels.length > 0
        ) {
            if (geocodedParcels.length > 0) {
                results.push({type: 'surveyParcel', data: geocodedParcels.pop()})
            }
            if (surveyParcels.length > 0) {
                results.push({type: 'surveyParcel', data: surveyParcels.pop()})
            }
            if (violations.length > 0) {
                results.push({type: 'violation', data: violations.pop()})
            }
            if (complaints.length > 0) {
                results.push({type: 'complaint', data: complaints.pop()})
            }
            if (rentals.length > 0) {
                results.push({type: 'rental', data: rentals.pop()})
            }
        }
        return results.slice(0, 5);
    }
}

class SurveyParcelCard {
    constructor(data, index) {
        this.HTML = `
            <a class="card" href="${encodeURI(URI + '?type=parcel&parcelpin=' + data.survey_parcel) || ''}">
                <figure class="card__photo">
                    <img id="rentalCardImage_${index}" src=${data.survey_image_1}>
                    <span class="badge">${data.survey_property_use} Parcel</span>
                    <button class="save" aria-label="">
                        ${data.survey_grade}
                    </button>
                </figure>
    
                <div class="body">
                    <div class="survey-line">${data.survey_address}</div>
                    <div class="address">Parcel: ${data.survey_parcel}</div>
    
                    <div class="inventory">
                        <div class="inv">
                            <strong id="violationSubHeader_${index}>...</strong>
                            <small>Code Violation Notices</small>
                        </div>
                        <div class="inv">
                            <strong id="rentalSubHeader_${index}">...</strong>
                            <small>Rental Registrations</small>
                        </div>
                    </div>
                </div>
            </a>
        `;
    }

    makeHTML() {
        return this.HTML;
    }
}

class ViolationCard {
    constructor(data, index) {
        this.HTML = `
            <a class="card" href="${encodeURI(URI + '?type=violation&record_id=' + data.RECORD_ID) || ''}">
                <figure class="card__photo">
                    <img id="rentalCardImage_${index}" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Round_Landmark_Icon_House.svg/480px-Round_Landmark_Icon_House.svg.png">
                    <span class="badge" style="background-color: red">Violation</span>
                </figure>
    
                <div class="body">
                    <div class="survey-line">${data.RECORD_ID}</div>
                    <div class="address">Type of Violation: ${data.TYPE_OF_VIOLATION}</div>
                    <div class="address">Parcel: ${data.DW_Parcel}</div>
                    <div class="address">Property Address: ${data.PRIMARY_ADDRESS}</div>

                </div>
            </a>
        `;
    }

    makeHTML() {
        return this.HTML;
    }
}

class ComplaintCard {
    constructor(data, index) {
        this.HTML = `
            <a class="card" href="${encodeURI(URI + '?type=complaint&record_id=' + data.PERMIT_ID) || ''}">
                <figure class="card__photo">
                    <img id="rentalCardImage_${index}" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Round_Landmark_Icon_House.svg/480px-Round_Landmark_Icon_House.svg.png">
                    <span class="badge" style="background-color: chocolate">Complaint</span>
                </figure>
    
                <div class="body">
                    <div class="survey-line">${data.PERMIT_ID}</div>
                    <div class="address">Type of Complaint: ${data.TYPE_OF_COMPLAINT}</div>
                    <div class="address">Property Address: ${data.PRIMARY_ADDRESS}</div>
                    <div class="address">Parcel: ${data.DW_Parcel}</div>
                </div>
            </a>
        `;
    }

    makeHTML() {
        return this.HTML;
    }
}

class RentalCard {
    constructor(data, index) {
        this.HTML = `
            <a class="card" href="${encodeURI(URI + '?type=rental&record_id=' + data.b1_alt_ID) || ''}">
                <figure class="card__photo">
                    <img id="rentalCardImage_${index}" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Round_Landmark_Icon_House.svg/480px-Round_Landmark_Icon_House.svg.png">
                    <span class="badge" style="background-color: purple">Rental Registration</span>
                </figure>
    
                <div class="body">
                    <div class="survey-line">${data.b1_alt_ID}</div>
                    <div class="address">Owner Org Name: ${data.OwnerOrgName}</div>
                    <div class="address">Property Address: ${data.Address}</div>
                    <div class="address">Parcel: ${data.DW_Parcel}</div>
                </div>
            </a>
        `;
    }

    makeHTML() {
        return this.HTML;
    }
}

class GeocodeService {
    constructor() {
        this.__loading = false;
        this.__loaded = false;
        this.data = [];
    }

    isLoaded() {
        return (this.__loaded && !this.__loading) || this.__disabled;
    }

    async load(query) {
        if (this.__loading || this.__loaded) return;
        this.__loading = true;

        const outFields = [
            'Default Address', 'Address or Place', 'Address2',
            'Address3', 'Neighborhood', 'City',
            'County', 'State', 'ZIP',
            'ZIP4', 'Country', 'Shape',
            'Status', 'Score', 'Match_addr',
            'LongLabel', 'ShortLabel', 'Addr_type',
            'Type', 'PlaceName', 'Place_addr',
            'Phone', 'URL', 'Rank',
            'BuildingName', 'AddressNumber'
        ];

        const params = new URLSearchParams({
            maxSuggestions: 6,
            outFields: outFields,
            SingleLine: query,
            f: 'json'
        });
        const url = `https://www.clevelandgis.org/arcgis/rest/services/Locators/City_of_Cleveland_Locator/GeocodeServer/findAddressCandidates?${params}`;

        const request = await fetch(url);
        const requestJSON =  await request.json();

        const addresses = requestJSON.candidates.map((row) => row.attributes.ShortLabel);

        if (addresses.length === 0) {
            this.__loading = false;
            this.__loaded = true;
            return;
        }

        const filterStatements = addresses.map((address) => new WhereClause('survey_address', address));
        this.__surveyParcelService = new FeatureService(
            'https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Citywide_Property_Survey_2022/FeatureServer/0/query',
            [
                'survey_address', 'survey_image_1', 'survey_grade',
                'survey_parcel', 'survey_property_use'
            ],
            (() => {}),
            filterStatements,
        );
        await this.__surveyParcelService.load();

        this.data = this.__surveyParcelService.data;

        this.__loading = false;
        this.__loaded = true;
    }
}

