const rand_color = () => `rgba(${Math.floor(Math.random()*256)},${Math.floor(Math.random()*256)},${Math.floor(Math.random()*256)},${Math.random()})`
const hexToRGB = (hex, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
}

Array.prototype.random = function() {
    return this[Math.floor(Math.random()*this.length)];
};
Object.defineProperty(window, 'r1', {
    get(){
        return 1 - 2*Math.random();
    }
});

const brushByName = name => {
    switch(name){
        case 'Plash':
            return Plash;
            break;
        case 'Spray':
            return Spray;
            break;
        case 'TinyLine':
            return TinyLine;
            break;
        case 'Spyder':
            return Spyder;
            break;
        case 'Stamp':
            return Stamp;
            break;
        case 'Mimage':
            return Mimage;
            break;
        case 'Line':
        default:
            return Line;
    }
};


const check_cross = (area1, area2) => {
    return (
        ((area1.x > area2.x && area1.x < area2.x + area2.w) &&
        (area1.y > area2.y && area1.y < area2.y + area2.h))
        ||
        ((area1.x + area1.w > area2.x && area1.x + area1.w < area2.x + area2.w) &&
        (area1.y + area1.h > area2.y && area1.y + area1.h < area2.y + area2.h))
    );
};
const check_in = (point, area) => {
    return (point.x >= area.x && point.x <= area.x + area.w) && (point.y >= area.y && point.y <= area.y + area.h);
};

const check_on_border = (point, area) => {
    return (
        (Math.abs(point.x - area.x) < 1 && point.y > area.y && point.y < area.y + area.h)
        ||
        (Math.abs(point.x - (area.x + area.w)) < 1 && point.y > area.y && point.y < area.y + area.h)
    );
};

const point_area = (point, size = 1) => ({x: point.x - size, y: point.y - size, w: size*2, h: size*2});

const check_on_point = (point, line) => {
    const area = point_area(point, 3);
    return line.points.findIndex(p => check_in({x: line.x + p.x, y: line.y + p.y}, area));
};