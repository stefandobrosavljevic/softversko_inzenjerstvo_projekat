export class HttpClient {
    constructor(options = {}) {
      this._baseURL = options.baseURL || "";
      this._headers = options.headers || {};
    }
  
    async _fetchJSON(endpoint, options = {}) {
      const res = await fetch(this._baseURL + endpoint, {
        ...options,
        headers: this._headers
      });
      /*if(res.status === 401 || res.status === 403) window.location.href = '401.html';
      else if(res.status === 404) window.location.href = '404.html';
      else if(res.status === 500) window.location.href = '500.html'; */
      if (!res.ok) 
      {
        let errorMsg = res.statusText;

        // prazan try/catch jer nas zanima samo da li ima atributa message i ako ima koristimo tu poruku za poruku greske
        try
        {
          let parsedJson = await res.json();
          errorMsg = parsedJson.message;
        }
        catch { }

        throw new Error(errorMsg);
      }
      
  
      if (options.parseResponse !== false && res.status !== 204)
        return res.json();
  
      return undefined;
    }
  
    setHeader(key, value) {
      this._headers[key] = value;
      return this;
    }
  
    getHeader(key) {
      return this._headers[key];
    }
  
    setBasicAuth(username, password) {
      this._headers.Authorization = `Basic ${btoa(`${username}:${password}`)}`;
      return this;
    }
  
    get(endpoint, options = {}) {
      return this._fetchJSON(endpoint, {
        ...options,
        method: "GET"
      });
    }
  
    post(endpoint, body, options = {}) {
      return this._fetchJSON(endpoint, {
        ...options,
        body: body ? JSON.stringify(body) : undefined,
        method: "POST"
      });
    }
  
    put(endpoint, body, options = {}) {
      return this._fetchJSON(endpoint, {
        ...options,
        body: body ? JSON.stringify(body) : undefined,
        method: "PUT"
      })
    }
  
    patch(endpoint, operations, options = {}) {
      return this._fetchJSON(endpoint, {
        parseResponse: false,
        ...options,
        body: JSON.stringify(operations),
        method: "PATCH"
      });
    }
  
    delete(endpoint, options = {}) {
      return this._fetchJSON(endpoint, {
        parseResponse: false,
        ...options,
        method: "DELETE"
      });
    }
  }
  
  //export default HttpClient;