import 'reflect-metadata';
import 'cordova';
import { container } from './inversify.config';
import { Types } from './types';
import { Application } from './application';

function startApp() {
    const app = container.get<Application>(Types.Application);
    app.run();
}

if (window.cordova) {
    document.addEventListener('deviceready', startApp, false);
} else {
    if (document.readyState === 'complete') {
        startApp();
    } else {
        window.addEventListener('load', startApp, false);
    }
}
