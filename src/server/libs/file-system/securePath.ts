export const securePath = (path: string): string => {
    return path.replace(/\..*?\//g, '/');
};
