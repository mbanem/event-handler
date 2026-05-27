export const handleTryCatch = (err, info) => {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(info, msg);
};
export const capitalize = (str) => {
    const spaceUpper = (su) => {
        // getting _string so return ' String' with a leading space
        return ` ${su[1]?.toUpperCase()}`;
    };
    let s = str[0]?.toUpperCase() + str.slice(1);
    return (s
        .replace(/\b[a-z](?=[a-z]{2})/g, (char) => char.toUpperCase())
        // snake_string_format replace _ with space
        .replace(/(_\w)/, spaceUpper));
};
// @ts-expect-error capitalize does not exist of string
String.prototype.capitalize = function () {
    return capitalize(this);
};
export function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}
// returns an array of attribute values as quotted if non-booleans
export function attrArrayOptional(match) {
    if (!match) {
        return ['', '', false, false, ''];
    }
    // match is RegExpMatchArray object; we skip the first item with .slice(1,...)
    // as it holds the whole search string. We return an array of attributes
    return [
        ...match.slice(1, 3),
        match[3] === '[]',
        match[4] === '?',
        match[5],
    ];
}
export function fieldAttrsFromLine(line) {
    return attrArrayOptional(line.match(/\s*(\w+)\s*(\w+)(\[\])?(\?)?\s*([@a-xA-Z0-9_():\[\]'", \t]*)?/));
}
// created object should have the following properties
const attrNames = [
    '"name": ',
    '"type": ',
    '"isArray": ',
    '"isOptional": ',
    '"attrs": ',
];
// create an object with attrNames with attribute values
export function stringToFieldObject(line) {
    if (!line) {
        return null;
    }
    // non-boolean attributes must be quotted for JSON
    function w(ix, el) {
        const q = [0, 1, 4].includes(ix) ? '"' : '';
        if (typeof el === 'string') {
            el = el.replace(/"/g, "'");
        }
        return `\t\t${attrNames[ix % 5]}${q}${el}${q},\n\t`;
    }
    const raw = attrArrayOptional(line.match(/\s*(\w+):?\s*(\w+)(\[\])?(\?)?\s*([@a-zA-Z0-9_():\[\]'", \t]*)?/)).reduce((acc, el, ix) => {
        return (acc = acc + w(ix, el));
    }, '\t{\n\t');
    // return JSON.parse(raw.slice(0,-3)+'\n\t}')
    return JSON.parse(raw.slice(0, -3) + '\n\t}');
}
//# sourceMappingURL=helpers.js.map