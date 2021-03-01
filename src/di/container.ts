interface Container {
    getService<T>(name: string): T,
}

type InstanceDefinition<T> = {
    instance: T,
}

type FactoryDefinition<T> = {
    instance?: T,
    factory: (container: Container) => T,
}

type DiServiceDefinition<T> = InstanceDefinition<T> | FactoryDefinition<T>;


function createContainer(definitions: {[name: string]: DiServiceDefinition<any>}): Container {
    function getService<T>(name: string): T {
        if (!(name in definitions)) {
            throw new Error("Service of name " + name + " was not found");
        }

        let definition = definitions[name] as DiServiceDefinition<T>;

        if (!definition.instance && 'factory' in definition) {
            definition.instance = definition.factory(container);
        }

        if (definition.instance) {
            return definition.instance;
        }

        throw new Error("Service of name " + name + " could not be instantiated");
    }

    const container = {
        getService,
    };

    return container;
}

export {
    createContainer,
};
