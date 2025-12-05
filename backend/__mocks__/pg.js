module.exports = {
    Pool: class {
        constructor() { }
        async query() {
            return { rows: [] };
        }
        async connect() {
            return { release: () => { } };
        }
        async end() { }
    }
};
