type EventBusData = { id: string };

interface EventTypes {
    'added-camera': EventBusData;
    'removed-camera': EventBusData;
    'added-configuration': EventBusData;
    'removed-configuration': EventBusData;
    'updated-configuration': { path: string; value: any };
    'theme-mode-changed': 'dark' | 'light';
}

// CustomEvent and dispatching events
// https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events#adding_custom_data_%E2%80%93_customevent

const eventBus = {
    on<K extends keyof EventTypes>(
        event: K,
        callback: (value: EventTypes[K]) => any,
    ) {
        document.addEventListener(
            event,
            (e: CustomEventInit<EventTypes[K]>) => {
                if (!e.detail) {
                    throw Error(
                        "Event bus misuse, event must have a 'detail' member",
                    );
                }

                callback(e.detail);
            },
        );
    },
    dispatch<K extends keyof EventTypes>(event: K, data: EventTypes[K]) {
        document.dispatchEvent(new CustomEvent(event, { detail: data }));
    },
    remove<K extends keyof EventTypes>(event: K, callback: any) {
        document.removeEventListener(event, callback);
    },
};

export default eventBus;
