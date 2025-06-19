export class FieldContainsStringStatement {
    constructor(field, string) {
        this.statement = `${field} like '%${string}%'`
    }
}

export class FeatureService {
    constructor(uri, selectedFields, loadedCallback, likeStatements=[]) {
        this.uri = uri;
        this.selectedFields = selectedFields;
        this.likeStatements = likeStatements;
        this.loaded = false;
        this.loadedCallback = loadedCallback;
        this.data = null;
        this.load();
    }

    makeParams() {
        const params = { 
            outFields: this.selectedFields.join(',')
        };
        
        if (this.likeStatements.length === 0) {
            return params;
        } else {
            params.where = this.likeStatements.map((stmt) => stmt.statement).join(' or ');
            return params;
        } 
    }

    async load() {
        const params = new URLSearchParams(this.makeParams());

        const url = `${this.uri}?${params}&f=json`;


        const result = await fetch(url);

        const resultJSON = await result.json();
        if (resultJSON.error !== undefined) {
            console.error(resultJSON.error.message);
            return;
        }

        this.data = resultJSON.features.map((row) => row.attributes);

        this.loaded = true;
        this.loadedCallback();
    }
}