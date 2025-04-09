export function findItemById(items, id, defaultValue = {}) {
    return items.find(item => item.id === id) || defaultValue;
}