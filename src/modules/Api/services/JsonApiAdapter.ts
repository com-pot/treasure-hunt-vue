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

    public delete<T=Object>(path: string, data?: object, query?: SearchParams): Promise<T> {
        return this.makeRequest('delete', path, data, query);
    }

    public makeRequest<T extends Object>(method: HttpMethod, path: string, data?: object, query?: SearchParams): Promise<T> {
        const requestInit: RequestInit = {
            method,
            headers: {
                Authorization: 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjIyMzc2Mjk5LCJleHAiOjE2MjQ5NjgyOTl9.uhuni1DYyKysfEMtqe0rehWDPSaw9KTRxmfCy2n42kk'
            },
        }
        if (data) {
            if (method === 'get') {
                console.warn("Passed data to a 'get' method. Omitting");
            } else {
                requestInit.body = JSON.stringify(data);
            }
        }

        const url = this.createFullUrl(path, query);
        return fetch(url, requestInit)
            .then((response) => {
                let contentType = response.headers.get('Content-Type') || ''
                if (!contentType.includes('application/json')) {
                    throw new Error("Invalid response content type");
                }

                return response.json() as Promise<T>;
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
