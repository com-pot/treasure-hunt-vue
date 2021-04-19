export const actions = {
    saveState<T extends object>(nodeId: string, state: T) {
        const serialized = JSON.stringify(state);
        localStorage.setItem(`node.${nodeId}.state`, serialized);
    },
    loadState<T>(nodeId: string): T|null {
        const serialized = localStorage.getItem(`node.${nodeId}.state`);
        const parsed = serialized ? JSON.parse(serialized) : null;

        if (!parsed) {
            console.debug(`Minigame '${nodeId} does not have a valid state stored'`);
            return null;
        }

        return parsed;
    },
    resetState: (nodeId: string) => {
        localStorage.removeItem(`node.${nodeId}.state`);
    },
};
