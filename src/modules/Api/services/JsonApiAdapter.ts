type HttpMethod = 'get' | 'post' | 'put' | 'delete' | string;
export type SearchParams = { [name: string]: string|number|undefined };

export default class JsonApiAdapter {

    public readonly defaultHeaders: Record<string, string|string> = {}

    constructor(private readonly baseUrl: string) {
        if (!this.baseUrl.endsWith('/')) {
            this.baseUrl += '/';
        }
    }

    public get<T=Object>(path: string, query?: SearchParams): Promise<T> {
        return this.makeRequest('get', path, undefined, query)
            .then(async (response) => this.responseToJson(response))
    }

    public post<T=Object>(path: string, data?: object, query?: SearchParams): Promise<T> {
        return this.makeRequest('post', path, data, query)
            .then(async (response) => this.responseToJson(response))
    }

    public put<T=Object>(path: string, data?: object, query?: SearchParams): Promise<T> {
        return this.makeRequest('put', path, data, query)
            .then(async (response) => this.responseToJson(response))
    }

    public patch<T=Object>(path: string, data: object, query?: SearchParams): Promise<T> {
        return this.makeRequest('patch', path, data, query)
            .then(async (response) => this.responseToJson(response))
    }

    public delete<T=Object>(path: string, data?: object, query?: SearchParams): Promise<T> {
        return this.makeRequest('delete', path, data, query)
            .then(async (response) => this.responseToJson(response))
    }

    public makeRequest<T extends Object>(method: HttpMethod, path: string, data?: object, query?: SearchParams) {
        const url = this.createFullUrl(path, query);
        return fetch(url, this.prepareRequestInit(method, data))
    }

    private prepareRequestInit(method: HttpMethod, data?: object): RequestInit {
        const headers = {...this.defaultHeaders}

        const requestInit: RequestInit = {
            method,
            headers,
        }
        if (data) {
            if (method === 'get') {
                console.warn("Passed data to a 'get' method. Omitting");
            } else {
                requestInit.body = JSON.stringify(data);
                headers['Content-Type'] = 'application/json; charset=utf-8'
            }
        }

        return requestInit
    }
    async responseToJson(response: Response): Promise<any> {
        const bodyStr = await response.text()

        let contentType = response.headers.get('Content-Type') || ''
        if (!contentType.includes('application/json')) {
            let error = new Error("Invalid response content type") as any;
            error.response = response
            error.body = bodyStr
            throw error;
        }

        const body = JSON.parse(bodyStr)

        if (response.status >= 400) {
            const e = new Error("Erroneous response") as any
            e.response = response
            e.body = body
            throw e
        }

        return body
    }
    private createFullUrl(path: string, query?: SearchParams): string {
        const url = new URL(this.baseUrl);
        url.pathname += path.startsWith('/') ? path.substr(1) : path;

        if (query) {
            for (let name in query) {
                let value = query[name];
                if (!value) {
                    continue;
                }
                url.searchParams.set(name, typeof value === "number" ? '' + value : value);
            }
        }

        return url.href;
    }
}
