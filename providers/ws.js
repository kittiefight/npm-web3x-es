/*
  This file is part of web3x.

  web3x is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  web3x is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License
  along with web3x.  If not, see <http://www.gnu.org/licenses/>.
*/
import Ws from 'isomorphic-ws';
import { isArray } from 'util';
import { LegacyProviderAdapter } from './legacy-provider-adapter';
export class WebsocketProvider extends LegacyProviderAdapter {
    constructor(url, options = {}) {
        const legacyProvider = new LegacyWebsocketProvider(url, options);
        super(legacyProvider);
        this.legacyProvider = legacyProvider;
    }
    disconnect() {
        this.legacyProvider.disconnect();
    }
}
class LegacyWebsocketProvider {
    constructor(url, options = {}) {
        this.responseCallbacks = {};
        this.notificationCallbacks = [];
        this.lastChunk = '';
        this.connected = false;
        this.onOpen = () => {
            this.connected = true;
        };
        this.onError = () => {
            this.timeout();
        };
        this.onClose = () => {
            this.timeout();
            this.reset();
            this.connected = false;
        };
        this.onMessage = (e) => {
            const data = typeof e.data === 'string' ? e.data : '';
            this.parseResponse(data).forEach(result => {
                let id = null;
                // get the id which matches the returned id
                if (isArray(result)) {
                    result.forEach((load) => {
                        if (this.responseCallbacks[load.id]) {
                            id = load.id;
                        }
                    });
                }
                else {
                    id = result.id;
                }
                // notification
                if (!id && result && result.method && result.method.indexOf('_subscription') !== -1) {
                    this.notificationCallbacks.forEach(callback => {
                        callback(result);
                    });
                    // fire the callback
                }
                else if (id && this.responseCallbacks[id]) {
                    this.responseCallbacks[id].callback(undefined, result);
                    delete this.responseCallbacks[id];
                }
            });
        };
        this.options = options;
        this.connection = new Ws(url, options.protocol, options.clientOptions);
        this.connection.onopen = this.onOpen;
        this.connection.onerror = this.onError;
        this.connection.onclose = this.onClose;
        this.connection.onmessage = this.onMessage;
    }
    parseResponse(data) {
        const returnValues = [];
        // DE-CHUNKER
        const dechunkedData = data
            .replace(/\}[\n\r]?\{/g, '}|--|{') // }{
            .replace(/\}\][\n\r]?\[\{/g, '}]|--|[{') // }][{
            .replace(/\}[\n\r]?\[\{/g, '}|--|[{') // }[{
            .replace(/\}\][\n\r]?\{/g, '}]|--|{') // }]{
            .split('|--|');
        dechunkedData.forEach(data => {
            // prepend the last chunk
            if (this.lastChunk) {
                data = this.lastChunk + data;
            }
            let result = null;
            try {
                result = JSON.parse(data);
            }
            catch (e) {
                this.lastChunk = data;
                // start timeout to cancel all requests
                clearTimeout(this.lastChunkTimeout);
                this.lastChunkTimeout = setTimeout(() => {
                    this.timeout();
                    throw new Error(`Invalid response data: ${data}`);
                }, 1000 * 15);
                return;
            }
            // cancel timeout and set chunk to null
            clearTimeout(this.lastChunkTimeout);
            this.lastChunk = '';
            if (result) {
                returnValues.push(result);
            }
        });
        return returnValues;
    }
    addResponseCallback(payload, callback) {
        const id = payload.id || payload[0].id;
        const method = payload.method || payload[0].method;
        this.responseCallbacks[id] = { callback, method };
        // schedule triggering the error response if a custom timeout is set
        if (this.options.timeout) {
            setTimeout(() => {
                if (this.responseCallbacks[id]) {
                    this.responseCallbacks[id].callback(new Error('Connection timeout'), undefined);
                    delete this.responseCallbacks[id];
                }
            }, this.options.timeout);
        }
    }
    timeout() {
        for (const key in this.responseCallbacks) {
            if (this.responseCallbacks[key]) {
                this.responseCallbacks[key].callback(new Error('Connection error'), undefined);
                delete this.responseCallbacks[key];
            }
        }
    }
    send(payload, callback) {
        if (this.connection.readyState === this.connection.CONNECTING) {
            setTimeout(() => {
                this.send(payload, callback);
            }, 10);
            return;
        }
        if (this.connection.readyState !== this.connection.OPEN) {
            // tslint:disable-next-line:no-console
            console.error('connection not open on send()');
            this.onError();
            callback(new Error('connection not open'), undefined);
            return;
        }
        this.connection.send(JSON.stringify(payload));
        this.addResponseCallback(payload, callback);
    }
    on(type, callback) {
        switch (type) {
            case 'data':
                this.notificationCallbacks.push(callback);
                break;
            default:
                throw new Error('Only supports data.');
        }
    }
    removeListener(type, callback) {
        switch (type) {
            case 'data':
                const i = this.notificationCallbacks.indexOf(callback);
                if (i !== -1) {
                    this.notificationCallbacks.splice(i, 1);
                }
                break;
            default:
                throw new Error('Only supports data.');
        }
    }
    removeAllListeners(type) {
        switch (type) {
            case 'data':
                this.notificationCallbacks = [];
                break;
            default:
                throw new Error('Only supports data.');
        }
    }
    reset() {
        this.timeout();
        this.notificationCallbacks = [];
    }
    disconnect() {
        if (this.connection) {
            this.connection.close();
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHJvdmlkZXJzL3dzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7RUFlRTtBQUVGLE9BQU8sRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFDbEQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUcvQixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQWFsRSxNQUFNLE9BQU8saUJBQWtCLFNBQVEscUJBQXFCO0lBRzFELFlBQVksR0FBVyxFQUFFLFVBQW9DLEVBQUU7UUFDN0QsTUFBTSxjQUFjLEdBQUcsSUFBSSx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDakUsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO0lBQ3ZDLENBQUM7SUFFTSxVQUFVO1FBQ2YsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNuQyxDQUFDO0NBQ0Y7QUFFRCxNQUFNLHVCQUF1QjtJQVMzQixZQUFZLEdBQVcsRUFBRSxVQUFvQyxFQUFFO1FBUHZELHNCQUFpQixHQUFxQyxFQUFFLENBQUM7UUFDekQsMEJBQXFCLEdBQTJCLEVBQUUsQ0FBQztRQUVuRCxjQUFTLEdBQVcsRUFBRSxDQUFDO1FBRXhCLGNBQVMsR0FBWSxLQUFLLENBQUM7UUFZMUIsV0FBTSxHQUFHLEdBQUcsRUFBRTtZQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUN4QixDQUFDLENBQUM7UUFFTSxZQUFPLEdBQUcsR0FBRyxFQUFFO1lBQ3JCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDLENBQUM7UUFFTSxZQUFPLEdBQUcsR0FBRyxFQUFFO1lBQ3JCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNmLElBQUksQ0FB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