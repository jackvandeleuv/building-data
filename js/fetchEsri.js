export class WhereClause {
    constructor(field, string, exactMatch=false) {
        if (exactMatch) {
            this.statement = `${field} like '${string}'`;
        } else {
            this.statement = `${field} like '%${string}%'`;
        }
    }
}

export class FeatureService {
    constructor(uri, selectedFields, callback, likeStatements=[], JSONPRequired=false, disabled=false) {
        this.uri = uri;
        this.selectedFields = selectedFields;
        this.likeStatements = likeStatements;
        this.__loading = false;
        this.__loaded = false;
        this.callback = callback;
        this.data = [];
        this.__JSONPRequired = JSONPRequired;
        this.__disabled = disabled;
    }

    __makeParams() {
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

    isDisabled() {
        return this.__disabled;
    }

    isLoaded() {
        return (this.__loaded && !this.__loading) || this.__disabled;
    }

    async __loadJSONPService() {
        return new Promise((resolve, reject) => {
            const callbackID = "jsonp_" + Date.now();

            const params = new URLSearchParams(this.__makeParams());
            const url = `${this.uri}?${params}&f=pjson&callback=${callbackID}`;

            window[callbackID] = (payload) => {
                try {
                    if (payload.error) {
                        reject(new Error(payload.error.message));
                        return;
                    }
                    this.data = payload.features.map(f => f.attributes);
                    resolve();                   
                } finally {
                    delete window[callbackID];              
                    script.remove();
                }
            };

            const script = document.createElement("script");
            script.src = url;
            script.onerror = () => reject(new Error("JSONP load error"));
            document.head.appendChild(script);
        });
    }
    
    async __loadJSONService() {
        const params = new URLSearchParams(this.__makeParams());

        const url = `${this.uri}?${params}&f=json`;

        const result = await fetch(url);

        const resultJSON = await result.json();
        if (resultJSON.error !== undefined) {
            console.error(resultJSON.error.message);
            return;
        }

        this.data = resultJSON.features.map((row) => row.attributes);
    }

    async load() {
        if (this.__loading || this.__loaded || this.__disabled) return;
        
        this.__loading = true;

        if (this.__JSONPRequired) {
            await this.__loadJSONPService();
        } else {
            await this.__loadJSONService();
        }
        
        this.__loaded = true;
        this.__loading = false;
        this.callback();
    }
}