const panels = document.getElementsByClassName('panel');
[...panels].forEach(panel => {
    panel.onmousedown = e => {
        if(e.target !== panel) {
            return;
        }
        const deltaX = e.clientX - parseInt(panel.style.left || 10);
        const deltaY = e.clientY - parseInt(panel.style.top || 10);
        const listener = e => {
            panel.style.top = (e.clientY - deltaY) + 'px';
            panel.style.left = (e.clientX - deltaX) + 'px';
        }
        document.addEventListener('mouseup', e => {
            document.removeEventListener('mousemove', listener);
        });
        document.addEventListener('mousemove', listener);
    }
});

function show_save(name) {
    if(!name) return;
savelist.innerHTML = `
<div class="save_row">
    <b>${name}</b>
    <button class="icon" onclick="clipboard('${name}')"><img src="./img/copy.png"></button>
    <button class="icon" onclick="load('${name}')"><img src="./img/open.png"></button>
    <button class="icon" onclick="load_tab('${name}')"><img src="./img/open_new.png"></button>
</div>
<br/>
${savelist.innerHTML}`;
}

if(localStorage.getItem('saves')) {
    localStorage.getItem('saves').split(',').forEach(show_save);
} else {
    localStorage.setItem('saves', '');
}

if(location.href.split('#').length > 1) {
    load(location.href.split('#')[1]);
}
window.addEventListener('hashchange', () => load(location.href.split('#')[1]));


const trim_num = (num, trim = 2) => num > 1e10 ? 1e10 : (num < -1e10 ? -1e10 : Math.round(+num * (10 ** trim)) / (10 ** trim));
const zipPoint = point => {
    const {x,y,dx,dy} = point;
    const p = [trim_num(x), trim_num(y)];
    if(dx || dy) p.push(trim_num(dx), trim_num(dy));
    return p;
};
const unzipPoint = ([x,y,dx,dy]) => {
    const p = {x,y};
    if(dx || dy){
        p.dx = dx;
        p.dy = dy;
    }
    return p;
};
function showSave(){
    filename.value = (Date.now()).toString(16);
    savePanel.classList.remove('hidden');
}
function save() {
    const savename = filename.value;
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/painf/save", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4) {
            switch(xhr.status) {
                case 200:
                    const saves = localStorage.getItem('saves').split(',').filter(u => !!u);
                    saves.push(savename);
                    localStorage.setItem('saves', saves.join(','));
                    show_save(savename);
                    savePanel.classList.add('hidden');
                    break;
                case 413:
                    alert('Слишком большой файл(');
                    break;
                case 400:
                    alert(xhr.responseText);
                    break;
                default:
                    alert('Что-то пошло не так(');
            }
        }
    };

    xhr.send(JSON.stringify({
        filename: savename,
        mutables: mutables.map(m => {
            const saved = {
                brushname: m.brushname || m.constructor.name,
            };
            if(saved.brushname === 'Mimage') {
                const t_canvas = document.createElement("canvas");
                t_canvas.width = m.img.width;
                t_canvas.height = m.img.height;
                const t_ctx = t_canvas.getContext("2d");
                t_ctx.drawImage(m.img, 0, 0);
                saved.img = t_canvas.toDataURL("image/png");
                t_canvas.remove();
            } else {
                saved.points = m.points.map(zipPoint);
                saved.original_points = m.original_points.map(zipPoint);
            }
            ["ax", "ay", "vx", "vy", "dx", "dy", "x", "y", "originalX", "originalY"].forEach(prop => {
                if (m[prop] !== defaults[prop]) {
                    saved[prop] = trim_num(m[prop]);
                }
            });
            ["angle", "rotate", "deform", "rx", "ry", "degrade"].forEach(prop => {
                if(m[prop] !== defaults[prop]) {
                    saved[prop] = trim_num(m[prop], 4);
                }
            });
            ["freeze", "blur", "width", "originalWidth", "lineCap", "color", "originalColor"].forEach(prop => {
                if(m[prop] !== defaults[prop]) {
                    saved[prop] = m[prop];
                }
            });
            return saved;
        })
    }));
}

function load(hash) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/painf/load/"+hash);
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            const savedMutables = JSON.parse(xhr.responseText);
            savedMutables.map(m => {
                if(m.brushname === 'Mimage') {

                } else {
                    m.points = m.points.map(unzipPoint);
                    m.original_points = m.original_points.map(unzipPoint);
                }
                return m;
            }).forEach(m => new (brushByName(m.brushname))(null, m));
        }
    };
    xhr.send();
}
function load_tab(hash) {
    const win = window.open(`${location.origin}/painf#${hash}`, '_blank');
    win.focus();
}
function clipboard(hash) {
    navigator.clipboard.writeText(`${location.origin}/painf#${hash}`, '_blank');
}

const keys = [];
document.onkeydown = e => {
    var code = e.which;
    switch(e.which){
        case 87:case 38://W
        mutables.forEach(line => line.vy-=Math.random());
        break;
        case 68:case 39://D
        mutables.forEach(line => line.vx+=Math.random());
        break;
        case 65:case 37://A
        mutables.forEach(line => line.vx-=Math.random());
        break;
        case 83:case 40://S
        mutables.forEach(line => line.vy+=Math.random());
        break;
        case 82: // R
            mutables.forEach(line => line.rotate += .03*r1);
            break;
        case 69: // E
            mutables.forEach(line => {
				const k = line.constructor.name === 'Mimage' ? 10 : .05;
                line.dx = k * r1;
                line.dy = k * r1;
            });
            break;
        case 81: // Q
            mutables.forEach(line => {
				const k = line.constructor.name === 'Mimage' ? .1 : .01;
                line.rx = k * r1;
                line.ry = k * r1;
            });
            break;
        case 84: // T
            mutables.forEach(line => {
                line.ax = .5 * r1;
                line.ay = .5 * r1;
            });
            break;
        case 67: // C
            mutables.forEach(line => line.color = rand_color());
            break;
        case 90: // Z
            mutables.forEach(line => line.degrade = true);
            break;
        case 70: // F
            mutables.forEach(line => line.deform += .1 * r1);
            break;
        case 73: // I
            panel.style.display = panel.style.display == 'none' ? 'block' : 'none';
            break;
        case 32:// anykey
            mutables.forEach(line => {
                ['vx','vy','ax','ay','dx','dy','rotate','deform','rx','ry','angle'].forEach(prop => line[prop] *= .66);
            });
            break;
        case 8:// backspace
            mutables.pop();
            break;
        case 46:// delete
            if(selected) {
                delete_line(selected[0]);
            }
            break;
        case 80://P
            paused = !paused;
            break;
        default:
            console.log(e.which);
            if(keys.indexOf(code)<0){
                keys.push(code);
            }
    }
};
document.onkeyup = e => keys.splice(keys.indexOf(e.which),1);

document.onmousewheel = e => {
	if(selected.length == 1) {
		const line = selected[0];
		if(line.constructor.name === 'Mimage') {
			line.dx += e.deltaY/50;
			line.dy += e.deltaY/50 * (line.h/line.w);
		} else {
			line.dx += e.deltaY/1500;
			line.dy += e.deltaY/1500;
		}
	}
};

selectedwidth.oninput = e => selected[0].originalWidth = selected[0].width = selectedwidth.value;
selectedblur.oninput = e => selected[0].blur = selectedblur.value;
selectedalpha.oninput = selectedcolor.onchange = e => selected[0].originalColor = selected[0].color = hexToRGB(selectedcolor.value, selectedalpha.value);


canvas2.addEventListener('mousemove', e => {
    if(selected.length) {
        const line = selected[0];
        const area = line.getArea();
        if(line.freeze) {
            // editing..
        } else if(line.constructor.name !== 'Mimage' && ~check_on_point({x: e.offsetX, y: e.offsetY}, line)) {
            canvas2.style.cursor = 'pointer';
        } else if (check_on_border({x: e.offsetX, y: e.offsetY}, area)) {
            canvas2.style.cursor = 'move';
        } else if(check_in({x: e.offsetX, y: e.offsetY}, area)) {
            canvas2.style.cursor = '-webkit-grab';
        } else {
            canvas2.style.cursor = 'crosshair';
        }
    }
});

iimport.onchange = e => {
    const file = iimport.files[0];
	if(file) {
	    const reader = new FileReader();
		reader.onload = () => {
			const img = new Image();
			img.onload = () => new Mimage(img);
			img.src = reader.result;
		};
		reader.readAsDataURL(file);
	}
};

canvas2.ondrop = e => {
    console.log(123);
    e.stopPropagation();
    e.preventDefault();
    if (e.dataTransfer.items) {
        console.log('File(s) dropped');
        // Use DataTransferItemList interface to access the file(s)
        for (var i = 0; i < e.dataTransfer.items.length; i++) {
            // If dropped items aren't files, reject them
            if (e.dataTransfer.items[i].kind === 'file') {
                var file = e.dataTransfer.items[i].getAsFile();
                console.log('..... file[' + i + '].name = ' + file.name);
            }
        }
    } else {
        // Use DataTransfer interface to access the file(s)
        for (var i = 0; i < e.dataTransfer.files.length; i++) {
            console.log('... file[' + i + '].name = ' + e.dataTransfer.files[i].name);
        }
    }
};

function select(e) {
    selected.forEach(m => (m.color = m.originalColor, m.freeze = false));
    selected = mutables.filter(m => {
        const area = m.getArea();
        return area.x < e.offsetX && area.x + area.w > e.offsetX && area.y < e.offsetY && area.y + area.h > e.offsetY
    });
    selected.forEach(m => (m.color = 'red', m.blur = 1));
    setSelectPanel();
}
function setSelectPanel() {
    if (selected.length == 0) {
        selectPanel.style.display = 'none';
    } else {
        selectPanel.style.display = 'block';
        if(selected.length == 1) {
            selectedList.style.display = 'none';
            deleteselected.style.display = 'block';
            deleteselected.onclick = e => {
                delete_line(selected[0]);
                selectPanel.style.display = 'none';
                deleteselected.style.display = 'none';
            }
            selectedwidth.value = selected[0].width;
            selectedalpha.value = selected[0].alpha;
            selectedblur.value = selected[0].blur;

        } else {
            deleteselected.style.display = 'none';
            selectedList.style.display = 'block';
            selectedList.innerHTML = '';
            selected.forEach((line, i) => {
                const opt = document.createElement('option');
                opt.value = i;
                opt.innerHTML = line.constructor.name + ' ' + line.i;
                selectedList.appendChild(opt);
            });
        }
    }
}

selectedList.onchange = e => (selected.forEach(m => m.color = m.originalColor), selected = [selected[selectedList.value]], selected[0].color = 'red', setSelectPanel());


const handleChangeBrush = e => {
    selected.forEach(m => (m.color = m.originalColor, m.freeze = false));
    selected = [];
    setSelectPanel();
}
const brushes = [...document.getElementsByName('brush')];
brushes.forEach(b => b.onchange = handleChangeBrush);
const setBrush = name => brushes.find(b => b.value === name).checked = true;
const getBrush = () => brushes.find(b => b.checked).value;
