import { FeatureService } from "../../fetchEsri.js";

export class ParcelBody {
    constructor(containerID) {
        this.containerID = containerID;
        this.__loaded = false;
        this.__loading = false;
    }

    isLoaded() {
        return this.__loaded;
    }

    isLoading() {
        return this.__loading;
    }

    async load(callbackFunction, filterStatements) {
        if (this.__loading || this.__loaded) return;
        this.__loading = true;

        this.__service = new FeatureService(
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
            (() => {}),
            filterStatements
        );
        await this.__service.load();

        if (this.__service.isLoaded()) {
            this.renderLoadedComponent()
        } else {
            this.renderEmptyComponent()
        }

        if (this.__service.data === undefined || this.__service.data.length === 0) {
            this.__loaded = false;
            this.__loading = false;
            return;
        }

        this.owner = this.__service.data[0].owner || '';
        this.__loaded = this.__service.isLoaded();
        this.__loading = false;
        callbackFunction();
    }
    
    renderLoadedComponent() {
        const row = this.__service.data[0];

        document.getElementById(this.containerID).innerHTML = `
            <h1>${row.survey_address}</h1>
            <p class="parcelPageSubHeader">${row.survey_parcel}</p>
            <ul>
                <li>CURRENT_TASK: ${row.survey_created}</li>
                <li>CURRENT_TASK_STATUS: ${row.survey_property_cat}</li>
            </ul>
        `;
    }

    renderEmptyComponent() {
        document.getElementById(this.containerID).innerHTML = 'Could not load data.';
    }
}
