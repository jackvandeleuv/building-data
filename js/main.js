import loadParcelPage from "./parcelPage.js";
import { RentalPage } from "./components/rentalPage.js";
import { ComplaintPage } from "./components/complaintPage.js";
import { ViolationPage } from "./components/violationPage.js";
import { URI } from "./config.js";
import { ParcelPage } from "./components/parcelPage.js";

function makeCard(d, violationMap, rentalMap) {
    const violations = violationMap.get(d.survey_parcel) || 0;
    const rentals = rentalMap.get(d.survey_parcel) || 0;

    return `
        <article 
            class="card"
            data-href="${URI}?type=parcel&parcelpin=${d.survey_parcel}"
            role="link"      
            tabindex="0"
        >
            <figure class="card__photo">
                <img src=${d.survey_image_1}
                    alt="">
                <span class="badge">${d.survey_property_use}</span>
                <button class="save" aria-label="">
                    ${d.survey_grade}
                </button>
            </figure>

            <div class="body">
                <div class="survey-line">${d.survey_address}</div>
                <div class="address">Parcel: ${d.survey_parcel}</div>

                <div class="inventory">
                <div class="inv"><strong>${violations}</strong><small>Code Violation Notices</small></div>
                <div class="inv"><strong>${rentals}</strong><small>Rental Registrations</small></div>
                </div>
            </div>
        </article>
    `;
}

async function getSurveyData(addresses, query) {
    if (!addresses | addresses.length === 0) return;
    const addressQuery = addresses.map((address) => `address like '%${address}%'`).join(' or ');

    const url = (
        `https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/` +
        `Citywide_Property_Survey_2022/FeatureServer/0/query` +
        `?where=${addressQuery} or survey_parcel like '%${query}%'` +
        `&outFields=survey_address,survey_image_1,survey_grade,survey_parcel,survey_property_use` +
        `&resultRecordCount=20` +
        `&outSR=4326` +
        `&f=json`
    );

    const f = await fetch(encodeURI(url));
    const j = await f.json();

    return j.features.map((r) => r.attributes);
}


function appendCardData(d, violationMap, rentalMap) {
    const box = document.getElementById('resultBox');
    const HTML = box.innerHTML;
    const updatedHTML = HTML + makeCard(d, violationMap, rentalMap);
    box.innerHTML = updatedHTML;
}

async function getSupplementalData(parcels, service, parcelField) {
    const joined_parcels = parcels
        .map((a) => `${parcelField} like '%${a}%'`)
        .join(' or ');

    let filter = `?where=${joined_parcels}`;

    const url = (
        service +
        filter +
        `&outFields=${parcelField}` +
        `&outSR=4326` +
        `&f=json`
    );


    const f = await fetch(encodeURI(url));
    const j = await f.json();

    return j.features.map((row) => row.attributes[parcelField]);
}

function notifyNoSearchResults() {
    const resultBoxHeader = document.getElementById('resultBoxHeader');
    const resultBox = document.getElementById('resultBox');
    resultBoxHeader.innerHTML = 'No properties found.';
    resultBox.innerHTML = '';
}

async function search() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (!query) {
        notifyNoSearchResults();
        return;
    }

    const resultBoxHeader = document.getElementById('resultBoxHeader');
    const resultBox = document.getElementById('resultBox');
    resultBoxHeader.innerHTML = 'Searching...';
    
    const data = await getSurveyData(await findAddressCandidates(query), query);
    if (!data) {
        notifyNoSearchResults();
        return;
    }

    const parcels = data.map((d) => d.survey_parcel);
    if (parcels === undefined || parcels.length === 0) {
        notifyNoSearchResults();
        return;
    }

    const rentalService = 'https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Rental_Registrations/FeatureServer/0/query';
    const rentalIDs = await getSupplementalData(parcels, rentalService, 'DW_Parcel');
    const rentalMap = new Map();
    for (const rentalID of rentalIDs) {
        rentalMap.set(rentalID, (rentalMap.get(rentalID) || 0) + 1)
    }       

    const violationService = 'https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Complaint_Violation_Notices/FeatureServer/0/query';
    const violationIDs = await getSupplementalData(parcels, violationService, 'PARCEL_NUMBER');
    const violationMap = new Map();
    for (const violationID of violationIDs) {
        violationMap.set(violationID, (violationMap.get(violationID) || 0) + 1)
    }

    resultBoxHeader.innerHTML = 'Cleveland OH Properties';
    resultBox.innerHTML = '';
    for (const d of data) {
        appendCardData(d, violationMap, rentalMap)
    }
}

function addMainPageListeners() {
    document.getElementById('searchElem').addEventListener('keydown', (async (e) => {
        if (e.key !== 'Enter') return;
        window.location = encodeURI(`${URI}?type=search&q=${e.currentTarget.value}`);
    }));

    document.addEventListener('click', e => {
        const card = e.target.closest('.card[data-href]');
        if (card && !e.target.closest('button,a')) {
            window.location = card.dataset.href;
        }
    });

    document.getElementById('searchElem').addEventListener('input', (async (e) => {
        getSuggestion(e.currentTarget.value);
    }))
}

async function getSuggestion(query) {
    const params = new URLSearchParams({
        maxSuggestions: 6,
        text: query,
        f: 'json'
    });
    const url = `https://www.clevelandgis.org/arcgis/rest/services/Locators/City_of_Cleveland_Locator/GeocodeServer/suggest?${params}`;

    const request = await fetch(url);
    const requestJSON =  await request.json();
    if (!requestJSON || !requestJSON.suggestions) {
        document.getElementById('suggestionBox').innerHTML = '';
        return;
    }

    const suggestionCards = requestJSON.suggestions.map((row) => `<p>${row.text}</p>`).join('');

    document.getElementById('suggestionBox').innerHTML = suggestionCards;
}

async function findAddressCandidates(query) {
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
    return requestJSON.candidates.map((row) => row.attributes.ShortLabel);
}

function main() {
    const mainPage = `
        <header class="page-header">
            <h1>Access Building Data</h1>
            <p class="subtitle">Find building and housing data on Cleveland properties</p>
        </header>

        <div class="searchPageMainBox">
            <div class="searchbox">
                <input 
                    type="text" 
                    role="combobox" 
                    placeholder="Address or parcel ID"
                    value="" 
                    id="searchElem"
                >
                <div id="suggestionBox" class="suggestionBox">
                </div>
            </div>
            <h3 id="resultBoxHeader"></h3>
            <div class="resultBox" id="resultBox">
            </div>
        </div>
    `;

    const parcelPage = `
        <header class="parcelPageBanner">
            <a href="javascript:history.back()" class="back-btn" aria-label="Go back"><</a>
            <img id="parcelPageImage" alt="">
        </header>

        <div class="content" id="content">
            <div>
                <h1 id="parcelPageAddressHeader"></h1>
                <p class="parcelPageSubHeader" id="parcelPageSubHeader"></p>
            </div>
            
            <hr>

            <div class="parcelDetailBox">
                <h2>2022 Property Survey</h2>
                <div class="surveyBox", id="surveyBox">
                </div>
            </div>

            <hr>

            <div class="parcelDetailBox">
                <h2>Code Violation Records</h2>
                <div class="parcelDetails", id="violationBox">
                </div>
            </div>

            <hr>

            <div class="parcelDetailBox">
                <h2>Rental Registrations</h2>
                <div class="parcelDetails", id="rentalBox">
                </div>
            </div>
        </div>
    `;

    const params = new URLSearchParams(window.location.search);
    const pageType = params.get("type") || 'search';

    if (pageType === 'search') {
        document.getElementById('main').innerHTML = mainPage;
        addMainPageListeners();
        search();
    } else if (pageType === 'parcel') {
        new ParcelPage();
    } else if (pageType === 'rental') {
        new RentalPage();
    } else if (pageType === 'complaint') {
        new ComplaintPage();
    } else if (pageType === 'violation') {
        new ViolationPage();
    } else  {
        document.getElementById('main').innerHTML = parcelPage;
        loadParcelPage();
    }
}

main();
