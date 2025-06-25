import { daysAgoLabel } from './utils/utils.js';
import { URI } from './config.js';

const SURVEY_COLS = [
    'survey_address',
    'survey_parcel',
    'survey_created',
    'survey_property_cat',
    'survey_property_use',
    'survey_grade',
    'survey_condition_garage',
    'survey_condition_windows',
    'survey_condition_roof',
    'survey_condition_siding',
    'survey_condition_porch',
    'survey_condition_gutters',
    'survey_condition_chimney',
    'survey_condition_driveway',
    'survey_condition_lawn',
    'survey_vacantcondition',
    'survey_sourceofdistress',
    'survey_improvement',
    'survey_improvement_explained',
    'survey_LeadPlacard',
    'survey_paintpeeling',
    'survey_paintpeeling_location',
    'survey_bareSoil',
    'survey_sidewalk_existing',
    'survey_sidewalk_material',
    'survey_sidewalk_condition',
    'survey_CityTreeObstruction',
    'survey_treelawn_existing',
    'survey_PlantObstruction',
    'survey_dumping_existing',
    'survey_dumping_OnTreeLawn',
    'survey_vehicle_OnTreeLawn',
    'survey_InoperableVehicle',
    'survey_InoperableVehicle_locati',
    'survey_RVparked',
    'survey_RVparked_location',
    'survey_OpenToTrespassing',
    'survey_signof_SaleOrRent',
    'survey_trees',
    'survey_treesWidth',
    'survey_curb',
    'survey_curb_material',
    'survey_curb_condition',
    'survey_curbreveal_condition',
    'survey_streetcondition',
    'survey_FireHydrant_existing',
    'survey_FireHydrant_condition',
    'survey_FireHydrant_poordetail',
    'survey_ADAramp',
    'survey_ADAramp_receiving',
    'survey_truncatedDome_existing',
    'survey_truncateDome_detail',
    'survey_ImmediateInspection',
    'survey_notes',
    'survey_picture_status',
    'survey_image_1'
];

const RENTAL_FIELDS = [
    'b1_alt_id',
    'FileDate',
    'Units',
    'Status',
    'StatusDate',
    'OwnerName',
    'OwnerOrgName',
    'OwnerAddress',
    'AdditionalContactName'
];

const SURVEY_FIELDS = [
  {
    "name": "Property Classification",
    "items": [
      { "field": "survey_property_cat", "prefix": "" },
      { "field": "survey_property_use", "prefix": "" },
      { "field": "survey_grade", "prefix": "Survey grade" }
    ]
  },
  {
    "name": "Lead Paint & Environmental Hazards",
    "items": [
      { "field": "survey_LeadPlacard", "prefix": "Has lead placard:" },
      { "field": "survey_paintpeeling", "prefix": "Has peeling paint:" },
      { "field": "survey_paintpeeling_location", "prefix": "Paint peeling location is" },
      { "field": "survey_bareSoil", "prefix": "Has bare soil:" }
    ]
  },
  {
    "name": "Exterior Building Conditions",
    "items": [
      { "field": "survey_condition_garage", "prefix": "Garage is" },
      { "field": "survey_condition_windows", "prefix": "Has windows:" },
      { "field": "survey_condition_roof", "prefix": "Roof is" },
      { "field": "survey_condition_siding", "prefix": "Siding is" },
      { "field": "survey_condition_porch", "prefix": "Porch is" },
      { "field": "survey_condition_gutters", "prefix": "Gutters are" },
      { "field": "survey_condition_chimney", "prefix": "Chimney is" },
      { "field": "survey_condition_driveway", "prefix": "Driveway is" },
      { "field": "survey_condition_lawn", "prefix": "Lawn is" },
      { "field": "survey_vacantcondition", "prefix": "Vacant condition is" }
    ]
  },
  {
    "name": "Sidewalk & Curb",
    "items": [
      { "field": "survey_sidewalk_existing", "prefix": "Existing sidewalk:" },
      { "field": "survey_sidewalk_material", "prefix": "Sidewalk material is" },
      { "field": "survey_sidewalk_condition", "prefix": "Sidewalk condition is" },
      { "field": "survey_curb", "prefix": "Has curb:" },
      { "field": "survey_curb_material", "prefix": "Curb material is" },
      { "field": "survey_curb_condition", "prefix": "Curb condition is" },
      { "field": "survey_ADAramp", "prefix": "Has ADA ramp:" },
      { "field": "survey_ADAramp_receiving", "prefix": "Receiving ADA ramp is" },
      { "field": "survey_truncatedDome_existing", "prefix": "Has truncated dome:" },
    ]
  },
  {
    "name": "Tree Lawn & Obstructions",
    "items": [
      { "field": "survey_CityTreeObstruction", "prefix": "City-tree obstruction:" },
      { "field": "survey_treelawn_existing", "prefix": "Has treelawn:" },
      { "field": "survey_PlantObstruction", "prefix": "Has plant obstruction:" },
      { "field": "survey_trees", "prefix": "" },
      { "field": "survey_treesWidth", "prefix": "Tree width is" }
    ]
  },
  {
    "name": "Dumping & Vehicles",
    "items": [
      { "field": "survey_dumping_existing", "prefix": "Has dumping:" },
      { "field": "survey_dumping_OnTreeLawn", "prefix": "Has dumping on treelawn:" },
      { "field": "survey_vehicle_OnTreeLawn", "prefix": "Vehicle on treelawn:" },
      { "field": "survey_InoperableVehicle", "prefix": "Inoperable vehicle:" },
      { "field": "survey_InoperableVehicle_locati", "prefix": "Inoperable vehicle location:" },
      { "field": "survey_RVparked", "prefix": "RV parked:" },
      { "field": "survey_RVparked_location", "prefix": "RV parked location:" }
    ]
  }
];

async function get_rental_data(parcels, service) {
    const joined_parcels = parcels
        .map((a) => `DW_Parcel like '%${a}%'`)
        .join(' or ');

    let filter = `?where=${joined_parcels}`;

    const url = (
        service +
        filter +
        `&outFields=${RENTAL_FIELDS.join(',')}` +
        `&f=json`
    );

    const f = await fetch(encodeURI(url));
    const j = await f.json();
    
    return j.features.map((row) => row.attributes);
}

async function get_violation_data(parcels, service) {
    const joined_parcels = parcels
        .map((a) => `DW_Parcel like '%${a}%'`)
        .join(' or ');

    let filter = `?where=${joined_parcels}`;

    const url = (
        service +
        filter +
        `&outFields=record_id,file_date,task_name,task_status,task_date,task_sequence_number,type_of_violation,occupancy_or_use,issue_date` +
        `&outSR=4326` +
        `&f=json`
    );

    const f = await fetch(encodeURI(url));
    const j = await f.json();
    
    return j.features.map((row) => row.attributes);
}

function makeViolationCard(violation) {
    return `
        <li class="carosel-item item">
            <div class="thumb"></div>
            <div class="details">
                <h3 class="title">${violation.RECORD_ID}</h3>
                <p class="violation-type">${violation.TYPE_OF_VIOLATION}</p>
                <p class="meta">Status: ${violation.TASK_STATUS} (${daysAgoLabel(violation.TASK_DATE)})</p>
            </div>
            <span class="chevron">›</span>
        </li>
    `
}

function buildSurveyHTML(row) {
  return SURVEY_FIELDS
    .map(section => {
      const listItems = section.items
        .map(({ field, prefix }) => (row[field] ? `<li>${prefix} <span class="surveyListItem">${row[field]}</span></li>` : ""))
        .filter(Boolean)
        .join("");
      if (!listItems) return "";
      return `<div><strong>${section.name}</strong><ul>${listItems}</ul></div>`;
    })
    .filter(Boolean)
    .join("\n");
}

function insert_viol_cards(violationMap) {
    const violationBoxWrapper = document.getElementById('violationBox');

    if (violationMap.size === 0) {
        violationBoxWrapper.innerHTML = '<p>No code violation records found.</p>'
        return;
    };

    const violationBox = document.createElement('ul');
    violationBox.classList.add('violation-list');

    for (const record_id of violationMap.keys()) {
        const violation = violationMap.get(record_id);
        violationBox.innerHTML = violationBox.innerHTML + makeViolationCard(violation);
    }

    violationBoxWrapper.appendChild(violationBox);
}

function formatSurveyRow(inputRow) {
    const row = structuredClone(inputRow)
    for (const key of Object.keys(row)) {
        if (
            row[key] === '<Null>' | 
            row[key] === '' | 
            row[key] === null | 
            row[key] === undefined
        ) delete row[key];
    }
    return row;
}

function makeSurveyBox(d) {
    const row = formatSurveyRow(d);
    return buildSurveyHTML(row);
}

async function loadViolations(parcelpin) {
    const violations = await get_violation_data(
        [parcelpin], 
        'https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Violation_Status_History/FeatureServer/0/query',
    );
    violations.sort((a, b) => b.TASK_DATE - a.TASK_DATE);
    const violMap = new Map();
    for (const viol of violations) {
        if (violMap.has(viol.RECORD_ID)) continue;
        violMap.set(viol.RECORD_ID, viol);
    }
    insert_viol_cards(violMap);
}

function makeRentalBox(rental) {
    const units = Number(rental.Units) || 0;
    const unitsPostfix = units === 0 ? 'Units' : units > 1 ? 'Units' : 'Unit';

    return `
        <a href="${encodeURI(URI + '?type=rental&record_id=' + rental.b1_alt_ID)}">
            <li class="carosel-item item">
                <div class="thumb">
                </div>
                <div class="details">
                    <h3 class="title">${rental.b1_alt_ID}</h3>
                    <p class="price">${rental.OwnerName || rental.OwnerOrgName}</p>
                    <p class="meta">${rental.OwnerAddress}</p>
                    <p class="meta">Status: ${rental.Status} (${daysAgoLabel(rental.StatusDate)})</p>
                    <p class="meta">${units} ${unitsPostfix}</p>

                </div>
                <span class="chevron">
                    ›
                </span>
            </li>
        </a>
    `
}

function insertRentalCards(rentals) {
    const wrapper = document.getElementById('rentalBox');

    if (rentals.length === 0) {
        wrapper.innerHTML = '<p>No rental registrations found.</p>';
        return;
    };
    
    const box = document.createElement('ul');
    box.classList.add('violation-list');

    for (const rental of rentals) {
        box.innerHTML = box.innerHTML + makeRentalBox(rental);
    }

    wrapper.appendChild(box);
}

async function loadRentals(parcelpin) {
    const rentals = await get_rental_data(
        [parcelpin], 
        'https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Rental_Registrations/FeatureServer/0/query',
    );
    insertRentalCards(rentals);
}

export default async function loadParcelPage() {
    const params = new URLSearchParams(window.location.search);
    const pageType = params.get("type");
    const parcelpin = params.get("parcelpin");
    if (pageType !== 'test-parcel') return;

    const url = (
        `https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/` +
        `Citywide_Property_Survey_2022/FeatureServer/0/query` +
        `?where=survey_parcel like '%${parcelpin}%'` +
        `&outFields=${SURVEY_COLS.join(',')}` +
        `&resultRecordCount=1` +
        `&outSR=4326` +
        `&f=json`
    );

    const f = await fetch(encodeURI(url));
    const j = await f.json();
    const d = j.features.pop().attributes;

    document.getElementById('surveyBox').innerHTML = makeSurveyBox(d);

    document.getElementById('parcelPageImage').src = d.survey_image_1;
    document.getElementById('parcelPageAddressHeader').innerHTML = d.survey_address;
    document.getElementById('parcelPageSubHeader').innerHTML = d.survey_parcel;

    await loadViolations(parcelpin);
    await loadRentals(parcelpin);
}
