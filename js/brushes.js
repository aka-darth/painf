const colors = [
    'black', 'white', 'aqua',
    'DarkGoldenRod', 'GreenYellow', 'DarkBlue', 'transparent',
    'Navy', 'RebeccaPurple', 'IndianRed', 'Orange', 'gray',
    'StateBlue', 'black', 'OliveDrab', '#918725'
];

const defaults = {
    freeze: false,
    rotate: 0,
    deform: 0,
    angle: 0,
    degrade: 0,
    ax: 0,
    ay: 0,
    vx: 0,
    vy: 0,
    dx: 0,
    dy: 0,
    rx: 0,
    ry: 0,
    blur: 0,
    width: 1,
    originalWidth: 1,
    lineCap: 'round',
    color: 'rgba(0, 0, 0, 1)',
    originalColor: 'rgba(0, 0, 0, 1)'
};

const mutables = [];
class Mutable {
    constructor(preset) {
        if (preset) {
            Object.assign(this, defaults, preset);
        } else {
            Object.assign(this, defaults, {
                freeze: true,
                points: [],
                color: hexToRGB(color.value, alpha.value),
                originalColor: hexToRGB(color.value, alpha.value),
                width: width.value,
                originalWidth: width.value,
                blur: iblur.value,
                lineCap: linecap.value
            });
        }
        mutables.push(this);
    }
    get i(){
        return mutables.findIndex(m => m === this);
    }
    mutate() {
        if(this.freeze) return;
        if(this.ax || this.ay) {
            this.vx += this.ax/20;
            this.vy += this.ay/20;
        }
        this.x += this.vx;
        this.y += this.vy;

        if(this.x < 0) {
            this.x = 0;
            this.vx = - this.vx;
        }
        if(this.y < 0) {
            this.y = 0;
            this.vy = -this.vy;
        }
        if(this.x > canvas.width) {
            this.x = canvas.width;
            this.vx = - this.vx;
        }
        if(this.y > canvas.height) {
            this.y = canvas.height;
            this.vy = -this.vy;
        }

        if(this.rotate) {
            this.points = this.points.map(point => ({
                x: point.x * Math.cos(this.rotate) - point.y * Math.sin(this.rotate),
                y: point.x * Math.sin(this.rotate) + point.y * Math.cos(this.rotate),
                dx: point.dx,
                dy: point.dy,
            }));
        }

        if(this.degrade) {
            for(let i = 0; i < this.points.length; i++) {
                let point = this.points[i];
                point.x = this.original_points[i].x + (point.x - this.original_points[i].x) * .96;
                point.y = this.original_points[i].y + (point.y - this.original_points[i].y) * .96;
            }
            this.x = this.originalX + (this.x - this.originalX ) * .97;
            this.y = this.originalY + (this.y - this.originalY ) * .97;
            if(Math.abs(this.x - this.originalX) < 2 && Math.abs(this.y - this.originalY) < 2) {
                this.color = this.originalColor;
                this.width = this.originalWidth;
                if(!this.points.find((point, i) => Math.abs(point.y - this.original_points[i].y) > 1 && Math.abs(point.x - this.original_points[i].x) > 1)) {
                    this.degrade = false;
                }
            }
        } else {
            if(this.deform) {
                let prev = this.points[0];
                for(let i = 1; i < this.points.length; i++) {
                    this.points[i].x = prev.x + (this.points[i].x - prev.x) * Math.cos(this.deform) - (this.points[i].y - prev.y) * Math.sin(this.deform);
                    this.points[i].y = prev.y + (this.points[i].x - prev.x) * Math.sin(this.deform) + (this.points[i].y - prev.y) * Math.cos(this.deform);
                    prev = this.points[i];
                }
            }
            if(this.rx || this.ry) {
                let prev = this.points[0];
                for(let i = 1; i < this.points.length; i++) {
                    this.points[i].x = prev.x + (this.points[i].x - prev.x) * (1 + this.rx);
                    this.points[i].y = prev.y + (this.points[i].y - prev.y) * (1 + this.ry);
                    prev = this.points[i];
                }
            }
            if(this.dy || this.dx) {
                this.points = this.points.map(point => ({
                    x: point.x * (1 + this.dx),
                    y: point.y * (1 + this.dy),
                    dx: point.dx,
                    dy: point.dy,
                }));
            }
            if(this.angle) {
                let prev = this.points[0];
                for(let i = 1; i < this.points.length; i++) {
                    this.points[i].x = prev.x + (this.points[i].x - prev.x) * (1 + this.rx);// + (this.points[i].x - prev.x) * Math.cos(this.deform) - (this.points[i].y - prev.y) * Math.sin(this.deform);
                    this.points[i].y = prev.y + (this.points[i].y - prev.y) * (1 + this.ry);// + (this.points[i].x - prev.x) * Math.cos(this.deform) - (this.points[i].y - prev.y) * Math.sin(this.deform);
                    prev = this.points[i];
                }
            }
        }

        this.braces();
    }
    shape_mutate(){
        if(this.freeze) return;
        const mutation = Math.floor(Math.random()*11);
        switch(mutation) {
            case 0: // сжатие
                this.dy = .1 * r1;
                this.dx = .1 * r1;
                break;
            case 1: // деформация
                this.deform = .2 * r1;
                break;
            case 2:
                this.angle = r1 / 40;
                let prev = this.points[0];
                for(let i = 1; i < this.points.length; i++) {
                    this.points[i].x = prev.x + (this.points[i].x - prev.x) * Math.cos(this.angle) - (this.points[i].y - prev.y) * Math.sin(this.angle);
                    this.points[i].y = prev.y + (this.points[i].x - prev.x) * Math.sin(this.angle) + (this.points[i].y - prev.y) * Math.cos(this.angle);
                    prev = this.points[i];
                }
                break;
            case 3:
                this.width = Math.floor(Math.random() * 7) + 1;
                break;
            case 4:
                this.ax += r1/2;
                this.ay += r1/2;
                if(this.vx > 2) this.vx = 0;
                if(this.vy > 2) this.vy = 0;
                if(this.vx < -2) this.vx = 0;
                if(this.vy < -2) this.vy = 0;
                break;
            case 5:
                this.color = colors.random();
                break;
            case 6:
                if(Math.random() > .85) {
                    this.rotate = 0;
                } else if(Math.random() > .95) {
                    this.rotate = 2 * r1;
                } else if(this.rotate) {
                    this.rotate *= .8;
                } else {
                    this.rotate = .022 * r1;
                }
                break;
            case 7:
                if(Math.random() > .9) {
                    this.blur = Math.floor(Math.random()*30);
                }
            /*
             if(Math.random() > .7) {
             const area = this.getArea();
             const fr = Lines.find(line => check_cross(area, line.getArea()));
             if(fr) {
             join_lines(this, fr);
             } else {
             console.log('Comp not found', this);
             }
             }
             */
                break;
            case 8:
                if(r1 > .5) {
                    this.blur = 0;
                }
            /*
             if(Math.random() > .7) {
             explode_line(this);
             }
             */
                break;
            case 9:
                if(Math.random() > .9) {
                    this.rx = .03 * r1;
                    this.ry = .03 * r1;
                }
                break;
            case 10:
                if (r1 > .5) {
                    this.degrade = true;
                }
                break;
        }
        // console.log(`Mutation`, mutation, this.i);
    }
    braces() {
        ['deform', 'dx', 'dy'].forEach(prop => {
            this[prop] *= .9;
            if (isNaN(this[prop]) || (this[prop] > 0 && this[prop] < .00001) || (this[prop] < 0 && this[prop] > -.00001)) {
                this[prop] = 0;
            }
        });
        ['rx', 'ry', 'ax', 'ay', 'vx', 'vy', 'rotate', 'angle'].forEach(prop => {
            this[prop] *= .999;
            if (isNaN(this[prop]) || (this[prop] > 0 && this[prop] < .0000001) || (this[prop] < 0 && this[prop] > -.0000001)) {
                this[prop] = 0;
            }
        });
        ['deform', 'dx', 'dy', 'rx', 'ry',].forEach(prop => {
            this[prop] *= .95;
            if (isNaN(this[prop]) || (this[prop] > 0 && this[prop] < .0000001) || (this[prop] < 0 && this[prop] > -.0000001)) {
                this[prop] = 0;
            }
        });
        const area = this.getArea();
        if(area.w > canvas.width) {
            this.dy -= .005;
        }
        if(area.h > canvas.height) {
            this.dy -= -.005;
        }
    }
    setctx() {
        ctx.lineWidth = this.width;
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineCap = this.lineCap;
        ctx.lineJoin = this.lineCap == 'square' ? 'miter' : 'round';
        if(this.blur) {
            ctx.shadowBlur = this.blur;
            ctx.shadowColor = this.color;
        }
    }
    draw_end() {
        if(this.points.length < 2){
            this.destroy();
        } else {
            this.original_points = this.points.map(({x,y}) => ({x,y}));
            this.freeze = false;
        }
    }
    getArea(){
        const area = this.points.reduce((area, point) => {
            if(point.x > area.x1) area.x1 = point.x;
            if(point.x < area.x2) area.x2 = point.x;
            if(point.y > area.y1) area.y1 = point.y;
            if(point.y < area.y2) area.y2 = point.y;
            return area;
        }, {
            x1: 0, x2: 0, y1: 0, y2: 0
        });
        return {
            x: this.x + area.x2,
            y: this.y + area.y2,
            w: area.x1 - area.x2,
            h: area.y1 - area.y2
        }
    }
    destroy(){
        const index = mutables.findIndex(m => m === this);
        if(~index) {
            mutables.splice(index, 1);
        }
        delete this;
    }
}

class Line extends Mutable {
    constructor(e, preset){
        super(preset);
        if(e) {
            this.draw_start(e);
        } else if(preset) {
            this.original_points = preset.original_points || preset.points.map(({x,y}) => ({x,y}));
        }
    }
    move(e) {
        this.points.push({
            x: e.offsetX - this.x,
            y: e.offsetY - this.y
        });
    }
    draw_start(e) {
        this.x = e.offsetX;
        this.y = e.offsetY;
        this.originalX = this.x;
        this.originalY = this.y;
        this.points.push({x: 0, y: 0});
    }
    render() {
        this.setctx();
        ctx.beginPath();
        ctx.moveTo(this.x + this.points[0].x, this.y + this.points[0].y);
        for(let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.x + this.points[i].x, this.y + this.points[i].y);
        }
        ctx.stroke();
        ctx.closePath();
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
    }
}

class Spray extends Mutable  {
    constructor(e, preset){
        super(preset);
        if(!preset) {
            this.x = e.offsetX;
            this.y = e.offsetY;

            this.originalX = this.x;
            this.originalY = this.y;

            this.dint = setInterval(() => {
                this.addPoint();
            }, 11);
        }
    }
    addPoint() {
        const a = Math.PI*r1;
        this.points.push({
            x: r1 * Math.cos(a) * this.width * 4 + this.x - this.originalX,
            y: r1 * Math.sin(a) * this.width * 4 + this.y - this.originalY
        });
    }
    move(e) {
        this.x = e.offsetX;
        this.y = e.offsetY;
    }
    draw_end() {
        this.original_points = this.points.map(({x,y}) => ({x,y}));
        this.x = this.originalX;
        this.y = this.originalY;
        this.freeze = false;
        clearInterval(this.dint);
    }
    render(){
        this.setctx();
        ctx.beginPath();
        this.points.forEach(point => {
            if(this.lineCap === 'round') {
                if(this.freeze) {
                    ctx.arc(this.originalX + point.x, this.originalY + point.y, Math.sqrt(this.width), 0, Math.PI*2);
                } else {
                    ctx.arc(this.x + point.x, this.y + point.y, Math.sqrt(this.width), 0, Math.PI*2);
                }
                ctx.fill();
                ctx.closePath();
                ctx.beginPath();
            } else {
                if(this.freeze) {
                    ctx.fillRect(this.originalX + point.x, this.originalY + point.y, Math.sqrt(this.width), Math.sqrt(this.width));
                } else {
                    ctx.fillRect(this.x + point.x, this.y + point.y, Math.sqrt(this.width), Math.sqrt(this.width));
                }
            }
        });
        ctx.closePath();
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
    }
}

class TinyLine extends Mutable {
    constructor(e, preset){
        super(preset);
        this.width = 1 + this.width/10;
        this.originalWidth = this.width;
        if(e) {
            this.draw_start(e);
        } else if(preset) {
            this.original_points = preset.original_points || preset.points.map(({x,y}) => ({x,y}));
        }
    }
    move(e) {
        if(r1>-.3){
            this.points.push({
                x: e.offsetX - this.x,
                y: e.offsetY - this.y,
                dx: r1*5,
                dy: r1*5
            });
        }
    }
    draw_start(e) {
        this.x = e.offsetX;
        this.y = e.offsetY;
        this.originalX = this.x;
        this.originalY = this.y;
        this.points.push({x: 0, y: 0});
    }
    render() {
        this.setctx();
        ctx.beginPath();
        ctx.moveTo(this.x + this.points[0].x, this.y + this.points[0].y);
        for(let i = 1; i < this.points.length; i++) {
            ctx.moveTo(this.x + this.points[i-1].x, this.y + this.points[i-1].y);
            ctx.lineTo(this.x + this.points[i].x + this.points[i].dx, this.y + this.points[i].y + this.points[i].dy);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
    }
}

class Spyder extends Line {
    constructor(e, preset){
        super(e, preset);
    }
    render() {
        this.setctx();
        ctx.beginPath();
        ctx.moveTo(this.x + this.points[0].x, this.y + this.points[0].y);
        const step = 3 + Math.floor(Math.sqrt(this.points.length));
        for(let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.x + this.points[i].x, this.y + this.points[i].y);
        }
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.lineWidth = 2*this.width/step+.2;
        for(let i = 0; i < this.points.length; i+=step) {
            for(let j = 0; i - j*step >= 0; j++) {
                ctx.moveTo(this.x + this.points[i-j*step].x, this.y + this.points[i-j*step].y);
                ctx.lineTo(this.x + this.points[i].x, this.y + this.points[i].y);
            }
            ctx.moveTo(this.x + this.points[i].x, this.y + this.points[i].y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }
}

class DashedLine extends Line {
    constructor(e, preset){
        super(e, preset);
    }
    render() {
        this.setctx();
        ctx.beginPath();
        ctx.moveTo(this.x + this.points[0].x, this.y + this.points[0].y);
        const step = 3 + Math.floor(Math.sqrt(this.points.length));
        for(let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.x + this.points[i].x, this.y + this.points[i].y);
        }
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.lineWidth = 2*this.width/step+.2;
        for(let i = 0; i < this.points.length; i+=step) {
            for(let j = 0; i - j*step >= 0; j++) {
                ctx.moveTo(this.x + this.points[i-j*step].x, this.y + this.points[i-j*step].y);
                ctx.lineTo(this.x + this.points[i].x, this.y + this.points[i].y);
            }
            ctx.moveTo(this.x + this.points[i].x, this.y + this.points[i].y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }
}

class Mimage extends Mutable {
    constructor(img, preset) {
        super(preset || {
            img,
            x: canvas.width/2 - img.width/2,
            y: canvas.height/2 - img.height/2
        });
        if(preset) {
            this.img = new Image();
			this.img.onload = e => {
				this.w = this.img.width;
				this.h = this.img.height;
			}
            this.img.src = preset.img;
        } else {
            this.originalX = this.x;
            this.originalY = this.y;
			this.w = this.img.width;
			this.h = this.img.height;
            selected = [this];
            setBrush('Select');
        }
    }
    render(){
        if(this.angle || this.dx || this.dy || this.rx || this.ry) {
            ctx.save();
            ctx.setTransform(1, this.rx, this.ry, 1, 0, 0);
            ctx.translate(this.x + this.w/2, this.y + this.h/2);
            ctx.rotate(this.angle);
            ctx.drawImage(this.img, -this.w/2, -this.h/2, this.w, this.h);
            ctx.restore();
        } else {
            ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
        }
    }
    mutate(){
        if(this.freeze) return;
        if(this.ax || this.ay) {
            this.vx += this.ax/20;
            this.vy += this.ay/20;
        }
        this.x += this.vx;
        this.y += this.vy;

        if(this.x + this.img.width/2 < 0) {
            this.x = -this.img.width/2;
            this.vx = - this.vx;
        }
        if(this.y + this.img.height/2 < 0) {
            this.y = -this.img.height/2;
            this.vy = -this.vy;
        }
        if(this.x + this.img.width/2 > canvas.width) {
            this.x = canvas.width - this.img.width/2;
            this.vx = - this.vx;
        }
        if(this.y + this.img.height/2 > canvas.height) {
            this.y = canvas.height - this.img.height/2;
            this.vy = -this.vy;
        }

        if(this.rotate) {
            this.angle += this.rotate;
        }

        if(this.degrade) {
            this.x = this.originalX + (this.x - this.originalX ) * .97;
            this.y = this.originalY + (this.y - this.originalY ) * .97;
            this.w = this.img.width + (this.w - this.img.width ) * .97;
            this.h = this.img.height + (this.h - this.img.height ) * .97;
			this.braces();
            if(Math.abs(this.x - this.originalX) < 1 && Math.abs(this.y - this.originalY) < 1) {
                this.degrade = false;
            }
        } else {
            if(this.deform) {
				// worker.postMessage();
            }
            if(this.dy || this.dx) {
				this.w += this.dx;
				this.h += this.dy;
            }
        }

        this.braces();
    }
    shape_mutate(){
        if(this.freeze) return;
        const mutation = Math.floor(Math.random()*11);
        switch(mutation) {
            case 0: // сжатие
                this.dy = .9 * r1;
                this.dx = .9 * r1;
                break;
            case 1: // деформация
                this.deform = .2 * r1;
                break;
            case 4:
                this.ax += r1/2;
                this.ay += r1/2;
                break;
            case 6:
                if(Math.random() > .85) {
                    this.rotate = 0;
                } else if(Math.random() > .95) {
                    this.rotate = 2 * r1;
                } else if(this.rotate) {
                    this.rotate *= .8;
                } else {
                    this.rotate = .022 * r1;
                }
                break;
            case 7:
                if(Math.random() > .9) {
                    this.blur = Math.floor(Math.random()*30);
                }
                break;
            case 8:
                if(r1 > .5) {
                    this.blur = 0;
                }
                break;
            case 9:
                if(Math.random() > .9) {
                    this.rx = .03 * r1;
                    this.ry = .03 * r1;
                }
                break;
            case 10:
                if (r1 > .5) {
                    this.degrade = true;
                }
                break;
        }
    }
    getArea() {
        return {x: this.x, y: this.y, w: this.w, h: this.h}
    }
}

/*
 const plashes = [];
 class Plash extends Mutable {
 constructor(e){
 super();
 this.x = e.offsetX;
 this.y = e.offsetY;

 this.originalX = this.x;
 this.originalY = this.y;
 this.r = this.width;

 this.dint = setInterval(() => {
 this.addPoint();
 }, 10);
 plashes.push(this);
 this.points.push([-this.r, 0, 0, -this.r, this.r, 0, 0, this.r]);
 }

 addPoint() {
 const prevx = this.points[this.points.length-1][6];
 const prevy = this.points[this.points.length-1][7];
 this.points.push([prevx, prevy, 0, -this.r, this.r, 0, 0, this.r]);
 }
 move(e) {
 this.x = e.offsetX;
 this.y = e.offsetY;
 }
 draw_end() {
 this.original_points = this.points.map(({x,y}) => ({x,y}));
 this.x = this.originalX;
 this.y = this.originalY;
 this.freeze = false;
 clearInterval(this.dint);
 }
 render(){
 ctx.fillStyle = this.color;
 ctx.shadowColor = this.color;
 ctx.lineCap = this.lineCap;
 ctx.shadowBlur = this.blur;
 ctx.beginPath();
 this.points.forEach(point => {
 ctx.bezierCurveTo(...point.map((c, i) => ((i%2 ? this.y : this.x) + c)));
 });
 ctx.closePath();
 ctx.strokeStyle = this.color;
 ctx.stroke();
 ctx.shadowColor = 'transparent';
 }
 }


 brush.onchange = e => {
 console.log(brush.value);
 }

 const stampField = new class {
 constructor(){
 this.canvas = stamp;
 this.canvas.height = 100;
 this.canvas.width = 100;
 this.ctx = this.canvas.getContext('2d');
 this.ctx.fillStyle = 'transparent';
 this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
 this.pre = {x:false,y:false};
 this.canvas.onmousedown = this.draw_start.bind(this);
 }
 get data(){
 return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
 }
 draw(e){
 if(this.pre.x) {
 this.ctx.beginPath();
 this.ctx.moveTo(this.pre.x, this.pre.y);
 this.ctx.lineTo(e.offsetX, e.offsetY);
 this.ctx.fill();
 this.ctx.stroke();
 }
 this.pre.x = e.offsetX;
 this.pre.y = e.offsetY;
 }
 draw_end(){
 console.log('end');
 document.onmousemove = null;
 }
 draw_start(e) {
 this.ctx.beginPath();
 this.pre.x = e.offsetX;
 this.pre.y = e.offsetY;
 this.ctx.lineWidth = width.value;
 this.ctx.fillStyle = 'transparent';
 this.ctx.strokeStyle = color.value;
 this.ctx.shadowBlur = iblur.value;
 this.ctx.lineCap = linecap.value;
 this.ctx.shadowColor = this.color;
 document.onmousemove = this.draw.bind(this);
 document.onmouseup = this.draw_end.bind(this);
 console.log('start', this.pre);
 }
 };


 const Stamps = [];
 class Stamp extends Mutable {
 constructor(e){
 super();
 this.data = stampField.data;
 if(e) {
 this.draw_start(e);
 }
 }
 draw_start(e){
 this.x = e.offsetX;
 this.y = e.offsetY;
 this.points.push({x: 0, y: 0});
 }
 move(e){
 this.points.push({
 x: e.offsetX - this.x,
 y: e.offsetY - this.y
 });
 }
 draw_end(){
 this.original_points = this.points.map(({x,y}) => ({x,y}));
 this.originalX = this.x;
 this.originalY = this.y;
 this.freeze = false;
 }
 render(){
 //ctx.globalCompositeOperation = "lighter";
 try {
 this.points.forEach(point => {
 ctx.putImageData(this.data, this.x + point.x, this.y + point.y, 0, 0, stampField.canvas.width, stampField.canvas.height);
 });
 } catch(e) {
 console.log(this, 0, 0, stampField.canvas.width, stampField.canvas.height);
 console.error(e);
 } finally {
 //ctx.globalCompositeOperation = "source-over";
 }
 }
 }

 */