type HttpMethod = 'get' | 'post' | 'put' | 'delete' | string;
type SearchParams = { [name: string]: string|number };

export default class JsonApiAdapter {
    constructor(private readonly baseUrl: string) {
        if (!this.baseUrl.endsWith('/')) {
            this.baseUrl += '/';
        }
    }

    public get<T=Object>(path: string, query?: SearchParams): Promise<T> {
        return this.makeRequest('get', path, undefined, query);
    }

    public post<T=Object>(path: string, data?: object, query?: SearchParams): Promise<T> {
        return this.makeRequest('post', path, data, query);
    }

    public put<T=Object>(path: string, data?: object, query?: SearchParams): Promise<T> {
        return this.makeRequest('put', path, data, query);
    }

    public patch<T=Object>(path: string, data: object, query?: SearchParams): Promise<T> {
        return this.makeRequest('patch', path, data, query)
    }

    public delete<T=Object>(path: string, data?: object, query?: SearchParams): Promise<T> {
        return this.makeRequest('delete', path, data, query);
    }

    public makeRequest<T extends Object>(method: HttpMethod, path: string, data?: object, query?: SearchParams): Promise<T> {
        const headers: Record<string, string> = {}
        if (localStorage.getItem('sotw.authToken')) {
            headers.Authorization = 'Bearer ' + localStorage.getItem('sotw.authToken')
        }

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

        const url = this.createFullUrl(path, query);
        return fetch(url, requestInit)
            .then(async (response) => {
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

                return body as T
            });
    }

    private createFullUrl(path: string, query?: SearchParams): string {
        const url = new URL(this.baseUrl);
        url.pathname += path.startsWith('/') ? path.substr(1) : path;

        if (query) {
            for (let name in query) {
                if (!(name in query)) {
                    continue;
                }
                let value = query[name];
                url.searchParams.set(name, typeof value === "number" ? '' + value : value);
            }
        }

        return url.href;
    }
}
