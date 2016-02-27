function summary(ei) {
    var r = ei.act + ' (' + ei.rpos[0] + ',' + ei.rpos[1] + ') ' + ei.time.pattern('HH:mm:ss.S') + '; ';
    if (ei.act.indexOf('zoom') >= 0) {
        for (var i in ei) {
            if (i != 'act' && i != 'pos' && i != 'rpos' && i != 'time') {
                var v = ei[i];
                r += i + '=' + v + '; ';
            }
        }
    }
    return r;
}
function logcapture(q) {
    var el = $('.leftpanel')[0];
    el.innerHTML = '';
    for (var i = 0; i < q.length; i++) {
        var d = document.createElement('div');
        d.style.border = 'solid 1px silver';
        var tcs = q[i];
        for (var j = 0; j < tcs.length; j++) {
            var ei = tcs[j];
            d.innerHTML += ei.act + '(' + ei.rpos[0] + ',' + ei.rpos[1] + '); ';
        }
        el.appendChild(d);
    }
}
function logrecognize(q) {
    var el = $('.rightpanel')[0];
    el.innerHTML = '';
    for (var i = 0; i < q.length; i++) {
        var d = document.createElement('div');
        d.style.border = 'solid 1px silver';
        var ei = q[i];
        if (!ei.rpos) {
            debugger;
        }
        d.innerHTML += summary(ei);
        el.appendChild(d);
    }
}
