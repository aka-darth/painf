let selected = [];
/*
const worker = new Worker('/painf/calc.js');

worker.addEventListener('error', e => console.error(e), false);
worker.onmessage = e => {
    console.log(e);
};
*/

const ctx = canvas.getContext("2d");
const ctx2 = canvas2.getContext("2d");
ctx.font = '24px serif';

const resize = () => {
    canvas2.width = ctx.canvas.width  = window.innerWidth - 5;
    canvas2.height = ctx.canvas.height = window.innerHeight - 5;
};
resize();
window.addEventListener("resize", resize);

let text = `Нарисуй лисичку!`;
const dashes = [12, 3, 3];
setInterval(() => dashes.push(dashes.shift()), 666);
let paused = false;

const join_lines = (line1, line2) => {
    const deltaX = line2.x - line1.x;
    const deltaY = line2.y - line1.y;
    line2.points.forEach((point, i) => {
        line1.points.push({
            x: point.x + deltaX,
            y: point.y + deltaY
        })
        line1.original_points.push({
            x: line2.original_points.x + deltaX,
            y: line2.original_points.y + deltaY
        })
    });
    Lines.splice(line2.i, 1);
    for(let i = 0; i < Lines.length; i++) {
        Lines[i].i = i;
    }
    console.log('line', line2.i, 'push to', line1.i);
};
const explode_line = line => {
    if(line.points.length < 8) {
        return;
    }
    const points = [];
    const original_points = [];
    const old_length = line.points.length;
    while(points.length < old_length/2) {
        points.push(line.points.pop());
        original_points.push(line.original_points.pop());
    }
    new Line(null, {
        points,
        original_points,
        x: line.x,
        y: line.y,
        vx: line.vx,
        vy: line.vy,
        width: line.width
    })
};
const delete_line = line => {
    const i = mutables.findIndex(m => m === line);
    if(~i) {
        mutables.splice(i, 1);
    }
    const j = selected.findIndex(m => m === line);
    if(~j) {
        selected.splice(j, 1);
        setSelectPanel();
    }
};

/*
canvas.onmousedown = function(e) {
    switch(brush.value) {
        case "Select":
            select(e);
            break;
        default:
            let C = brushByName(brush.value);
            const instanse = new C(e);
            const listener = instanse.move.bind(instanse);
            document.addEventListener('mouseup', e => {
                document.removeEventListener('mousemove', listener);
                document.onmousemove = null;
                instanse.draw_end();
            });
            document.addEventListener('mousemove', listener);
    }
}
*/
canvas2.onmousedown = e => {
    switch(getBrush()) {
        case "Select":
            if (selected.length) {
                const line = selected[0];
                line.freeze = true;
                const area = line.getArea();
                let selectedPoint = -1;
                if(line.constructor.name !== 'Mimage') {
                    selectedPoint = check_on_point({x: e.offsetX, y: e.offsetY}, line);
                }

                if(~selectedPoint) {
                    canvas2.style.cursor = '-webkit-grabbing';
                    const startX = e.offsetX;
                    const startY = e.offsetY;
                    const listener = e => {
                        line.points[selectedPoint].x = line.original_points[selectedPoint].x + (e.offsetX - startX);
                        line.points[selectedPoint].y = line.original_points[selectedPoint].y + (e.offsetY - startY);
                    };
                    document.addEventListener('mousemove', listener);
                    document.addEventListener('mouseup', e => {
                        document.removeEventListener('mousemove', listener);
                        canvas2.style.cursor = '-webkit-grab';
                        line.original_points[selectedPoint].x = line.points[selectedPoint].x;
                        line.original_points[selectedPoint].y = line.points[selectedPoint].y;
                        line.freeze = false;
                    }, {once: true});
                } else if (check_on_border({x: e.offsetX, y: e.offsetY}, area)) {
                    canvas2.style.cursor = '-webkit-grabbing';
                    const startX = e.offsetX;
                    const startY = e.offsetY;
                    const listener = e => {
                        line.x = line.originalX + (e.offsetX - startX);
                        line.y = line.originalY + (e.offsetY - startY);
                    };
                    document.addEventListener('mousemove', listener);
                    document.addEventListener('mouseup', e => {
                        document.removeEventListener('mousemove', listener);
                        canvas2.style.cursor = '-webkit-grab';
                        line.originalX = line.x;
                        line.originalY = line.y;
                        line.freeze = false;
                    }, {once: true});
                } else if(check_in({x: e.offsetX, y: e.offsetY}, area)) {
                    canvas2.style.cursor = '-webkit-grabbing';
                    const startX = e.offsetX;
                    const startY = e.offsetY;
                    const listener = e => {
                        line.x = line.originalX + (e.offsetX - startX);
                        line.y = line.originalY + (e.offsetY - startY);
                    };
                    document.addEventListener('mousemove', listener);
                    document.addEventListener('mouseup', e => {
                        document.removeEventListener('mousemove', listener);
                        canvas2.style.cursor = '-webkit-grab';
                        line.originalX = line.x;
                        line.originalY = line.y;
                        line.freeze = false;
                    }, {once: true});
                } else {
                    canvas2.style.cursor = 'crosshair';
                    select(e);
                }
            } else {
                select(e);
            }
            break;
        default:
            let C = brushByName(getBrush());
            const instanse = new C(e);
            const listener = instanse.move.bind(instanse);
            document.addEventListener('mouseup', e => {
                document.removeEventListener('mousemove', listener);
                instanse.draw_end();
            }, {once: true});
            document.addEventListener('mousemove', listener);
    }
};


function mutate() {
	if (!paused && mutables.length > 8) {
	    // worker.postMessage({action: 'calc', mutables});
		mutables.random().shape_mutate();
		text = 'Не сдавайся!';
		if(mutables.length > 22) {
			text = 'У тебя всё получится!';
		}
		if(mutables.length > 33) {
			text = 'Улыбнись)';
		}
		if(mutables.length > 44) {
			text = 'Не останавливайся';
		}
		if(mutables.length > 66) {
			text = '';
		}
	} else {
		text = `Нарисуй лисичку!`;
	}
	setTimeout(mutate, mspeed.value);
}

function draw(){
    if(!paused) {
        try {
            if (smooth.checked) {
                ctx.fillStyle = `rgba(255, 255, 255, .01)`;
            } else {
                ctx.fillStyle = `white`;
            }
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            mutables.forEach(obj => obj.render());
			mutables.forEach(obj => obj.mutate());
        } catch(e) {
            console.error(e);
        }
    }
    try {
        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
		if (panel.style.display != 'none'){
			ctx2.fillStyle = `black`;
			ctx2.fillText(text, canvas.width/2, 40);
		}
        if(selected.length) {
            const line = selected[0];
            const area = line.getArea();
            ctx2.setLineDash(dashes);
            ctx2.strokeRect(...Object.values(area));
            ctx2.setLineDash([]);
            if(line.constructor.name !== 'Mimage') line.points.forEach(point => {
                ctx2.strokeRect(line.x + point.x - 1, line.y + point.y - 1, 3, 3);
            });
        }
    } catch(e) {
        console.error(e);
    }
	requestAnimationFrame(draw);
}

draw();
mutate();