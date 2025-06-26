import { WhereClause, FeatureService } from "../fetchEsri.js";

export function daysAgoLabel(unixDate) {
    const delta = Date.now() - unixDate;
    const daysAgo = Math.floor(delta / (1000 * 60 * 60 * 24));
    if (daysAgo === 0) {
        return 'Recent'
    } else if (daysAgo === 1) {
        return 'Yesterday'
    } else if (daysAgo < 365) {
        return `${daysAgo} days ago`
    } else if (daysAgo < 365 * 2) {
        return `1 year ago`
    } else {
        return `${Math.floor(daysAgo / 365)} years ago`
    }
}

function getMainRecordField(field, mainRecordService) {
    if (
        mainRecordService.data === undefined ||
        mainRecordService.data.length === 0 ||
        mainRecordService.data[0][field] === undefined ||
        mainRecordService.data[0][field] === ''
    ) {
        return '';
    }
    return mainRecordService.data[0][field].trim();
}

// DW_Parcel
export function loadRentals(rentalService, mainRecordService, callbackFunction, joinFieldLeft, joinFieldRight) {
    if (rentalService !== undefined) return rentalService;

    const mainRecordValue = getMainRecordField(joinFieldLeft, mainRecordService);
    const serviceDisabled = mainRecordValue === '';
    const filterStatements = [new WhereClause(joinFieldRight, mainRecordValue)];

    const service = new FeatureService(
        'https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Rental_Registrations/FeatureServer/0/query',
        [
            "b1_alt_ID", "DW_Parcel", "AddressFull",
            "FileDate", "Address", "Units",
            "Status", "StatusDate", "OwnerName",
            "OwnerOrgName", "OwnerAddress", "AdditionalContactName",
            "AdditionalContactOrgName", "AdditionalContactRelation", "AdditionalContactAddress"
        ],
        callbackFunction,
        filterStatements,
        false,
        serviceDisabled
    );
    service.load();
    return service;
}

// DW_Parcel
export function loadViolations(violationService, mainRecordService, callbackFunction, joinFieldLeft, joinFieldRight) {
    if (violationService !== undefined) return violationService;

    const mainRecordValue = getMainRecordField(joinFieldLeft, mainRecordService);
    const serviceDisabled = mainRecordValue === '';
    const filterStatements = [new WhereClause(joinFieldRight, mainRecordValue)];

    const service = new FeatureService(
        'https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Violation_Status_History/FeatureServer/0/query',
        [
            'RECORD_ID', 'FILE_DATE', 'PRIMARY_ADDRESS',
            'TASK_NAME', 'TASK_STATUS', 'TASK_SEQUENCE_NUMBER',
            'TYPE_OF_VIOLATION', 'OCCUPANCY_OR_USE', 'ISSUE_DATE',
            'ACCELA_CITIZEN_ACCESS_URL', 'DW_Parcel', 'TASK_DATE'
        ],
        callbackFunction,
        filterStatements,
        false,
        serviceDisabled
    );
            
    service.load();
    return service;
}

// OwnerOrgName, parcel_owner
export function loadSameOwnerParcels(parcelService, mainRecordService, callbackFunction, joinFieldLeft, joinFieldRight) {
    if (parcelService !== undefined) return parcelService;

    const mainRecordValue = getMainRecordField(joinFieldLeft, mainRecordService);
    const serviceDisabled = mainRecordValue === '';
    const filterStatements = [new WhereClause(joinFieldRight, mainRecordValue)];

    const service = new FeatureService(
        'https://gis.cuyahogacounty.us/server/rest/services/CCFO/EPV_Prod/FeatureServer/2/query',
        [
            'parcelpin', 'parcel_owner', 'last_transfer_date',
            'last_sales_amount', 'tax_luc_description', 'prop_class_desc',
            'parcel_addr', 'parcel_predir', 'parcel_street', 
            'parcel_suffix', 'parcel_unit', 'parcel_city'
        ],
        callbackFunction,
        filterStatements,
        true,
        serviceDisabled
    );
    service.load();
    return service
}

// DW_Parcel
export function loadComplaints(complaintService, mainRecordService, callbackFunction, joinFieldLeft, joinFieldRight) {
    if (complaintService !== undefined) return complaintService;

    const mainRecordValue = getMainRecordField(joinFieldLeft, mainRecordService);
    const serviceDisabled = mainRecordValue === '';
    const filterStatements = [new WhereClause(joinFieldRight, mainRecordValue)];

    const service = new FeatureService(
        'https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Complaint_Status_History/FeatureServer/0/query',
        [
            'PERMIT_ID', 'FILE_DATE', 'SOURCE',
            'CURRENT_TASK', 'CURRENT_TASK_STATUS', 'TASK_DATE',
            'TYPE_OF_COMPLAINT', 'DW_Parcel'
        ],
        callbackFunction,
        filterStatements,
        false,
        serviceDisabled
    );
    service.load();
    return service;
}