function EditProg() {
    this.type = VISU_TYPE.MAIN;
    this.container = {};
    this.data = [];
    this.data_ini = [];
    this.phone = [];
    this.initialized = false;
    this.controller_state = null;
    this.t1 = null;
    this.saveB = null;
    this.getB = null;
    this.helpB = null;
    this.bb = null;
    this.update = true;//editor will make it false
    this.last_sr = -1;
    this.last_sc = -1;
    this.del_block = false;//to deal with delete button and table click collision
    this.ROW = {
        ID: -1,
        DESCRIPTION: 0,
        GOAL: 1,
        DELTA: 2,
        CHANGE_GAP: 3,
    };
    this.ACTION = {
        GET: 3,
        SAVE: 4,
        RESET: 5
    };
    this.ACTIVE_SIGN = "&check;";
    this.FLOAT_PRS = 3;
    this.visible = false;
    this.init = function () {
        try {
            var self = this;
            this.container = cvis();
            this.t1 = new Table(self, 1, trans, [
                [300, "40%"],
                [301, "20%"],
                [302, "20%"],
                [303, "20%"]
            ]);
            this.t1.m_style = "copy_cell";
            this.t1.cellClickControl([true, true, true, true]);
            this.t1.enable();
            this.saveB = cb("");
            this.getB = cb("");
            this.helpB = new NavigationButton(vhelp, "f_js/image/help.png");
            this.saveB.onclick = function () {
                self.save();
            };
            this.getB.onclick = function () {
                self.getData();
            };
            this.bb = new BackButton();
            var rcont = cd();
            a(rcont, [this.getB, this.saveB, this.helpB, this.bb]);
            a(this.container, [this.t1, rcont]);
            cla([this.t1], ["w70m", "lg1"]);
            cla([rcont], ["w30m", "lg1"]);
            cla([this.saveB, this.getB, this.helpB, this.bb], ["h25m", "ug1", "f1"]);
            this.initialized = true;
        } catch (e) {
            alert("prog: init: " + e.message);
        }
    };
    this.getName = function () {
        try {
            return trans.get(400);
        } catch (e) {
            alert("prog: getName: " + e.message);
        }
    };
    this.updateStr = function () {
        try {
            this.t1.updateHeader();
            this.saveB.innerHTML = trans.get(1);
            this.getB.innerHTML = trans.get(57);
            this.helpB.updateStr();
            this.bb.updateStr();
        } catch (e) {
            alert("prog: updateStr: " + e.message);
        }
    };
    this.cellChanged = function (id) {
        try {
            if (this.del_block) {
                this.del_block = false;
                return;
            }
            if (this.last_sc === this.t1.sc && this.last_sr === this.t1.sr) {
                switch (this.t1.sc) {
                    case this.ROW.DESCRIPTION:
                        var self = this;
                        vstring_edit_smp.prep(this.data[this.t1.sr].description, app.NAME_SIZE, self, this.t1.sc, 300);
                        showV(vstring_edit_smp);
                        break;
                    case this.ROW.GOAL:
                        var self = this;
                        vfloat_edit.prep(this.data[this.t1.sr].goal, 0, INT32_MAX, self, this.t1.sc, 301);
                        showV(vfloat_edit);
                        break;
                    case this.ROW.DELTA:
                        var self = this;
                        vfloat_edit.prep(this.data[this.t1.sr].delta, 0, INT32_MAX, self, this.t1.sc, 302);
                        showV(vfloat_edit);
                        break;
                    case this.ROW.CHANGE_GAP:
                        var self = this;
                        vtime_edit.prep(this.data[this.t1.sr].change_gap, 0, INT32_MAX, self, this.t1.sc, 303);
                        showV(vtime_edit);
                        break;
                }
            }
            this.last_sc = this.t1.sc;
            this.last_sr = this.t1.sr;
        } catch (e) {
            alert("prog: cellChanged: " + e.message);
        }
    };
    this.catchEdit = function (d, k) {
        try {
            switch (k) {
                case this.ROW.DESCRIPTION:
                    this.data[this.t1.sr].description = d;
                    this.t1.updateCell(this.t1.sr, this.t1.sc, this.data[this.t1.sr].description);
                    break;
                case this.ROW.GOAL:
                    this.data[this.t1.sr].goal = d;
                    this.t1.updateCell(this.t1.sr, this.t1.sc, this.data[this.t1.sr].goal.toFixed(this.FLOAT_PRS))
                    break;
                case this.ROW.DELTA:
                    this.data[this.t1.sr].delta = d;
                    this.t1.updateCell(this.t1.sr, this.t1.sc, this.data[this.t1.sr].delta.toFixed(this.FLOAT_PRS));
                    break;
                case this.ROW.CHANGE_GAP:
                    this.data[this.t1.sr].change_gap = d;
                    this.t1.updateCell(this.t1.sr, this.t1.sc, intToTimeStr(this.data[this.t1.sr].change_gap));
                    break;
                default:
                    console.log("prog: catchEdit: bad k");
                    break;
            }
        } catch (e) {
            alert("prog: catchEdit: " + e.message);
        }
    };
    this.getData = function () {
        var data = [
            {
                action: ["program", "geta"]
            }
        ];
        cursor_blocker.enable();
        sendTo(this, data, this.ACTION.GET, "json_db");
    };
    this.resetContProg = function () {
        var arr = this.getChangedDataId();
        if (arr.length <= 0) {
            return;
        }
        var data = [
            {
                action: ["controller", "program", "reset"],
                param: arr
            }
        ];
        cursor_blocker.enable();
        sendTo(this, data, this.ACTION.RESET, "json_udp_acp");
    };
    this.save = function () {
        var arr = this.getChangedData();
        if (arr.length <= 0) {
            return;
        }
        var data = [
            {
                action: ['program', 'save'],
                param: arr
            }
        ];
        cursor_blocker.enable();
        sendTo(this, data, this.ACTION.SAVE, "json_db");
    };
    this.dataRowChanged = function (i) {
        if (
                this.data[i].description !== this.data_ini[i].description ||
                this.data[i].goal !== this.data_ini[i].goal ||
                this.data[i].delta !== this.data_ini[i].delta ||
                this.data[i].change_gap !== this.data_ini[i].change_gap
                ) {
            return true;
        }
        return false;
    };
    this.dataRowChangedR = function (i) {
        if (
                this.data[i].goal !== this.data_ini[i].goal ||
                this.data[i].delta !== this.data_ini[i].delta ||
                this.data[i].change_gap !== this.data_ini[i].change_gap
                ) {
            return true;
        }
        return false;
    };
    this.getChangedDataId = function () {
        var arr = [];
        for (var i = 0; i < this.data.length; i++) {
            if (this.dataRowChangedR(i)) {
                arr.push(this.data[i].id);
            }
        }
        return arr;
    };
    this.getChangedData = function () {
        var arr = [];
        for (var i = 0; i < this.data.length; i++) {
            if (this.dataRowChanged(i)) {
                arr.push(this.data[i]);
            }
        }
        return arr;
    };
    this.dataIniToData = function () {
        for (var i = 0; i < this.data.length; i++) {
            for(var j in this.data[i]){
               this.data_ini[i][j] = this.data[i][j];
            }
        }
    };
    this.confirm = function (action, d, n) {
        try {
            switch (action) {
                case this.ACTION.GET:
                    cleara(this.data);
                    cleara(this.data_ini);
                    var i = 0;
                    for (i = 0; i < d.length; i++) {
                        this.data.push({
                            id: parseInt(d[i].id),
                            description: d[i].description,
                            goal: parseFloat(d[i].goal),
                            delta: parseFloat(d[i].delta),
                            change_gap: parseInt(d[i].change_gap)
                        });
                        this.data_ini.push({
                            id: parseInt(d[i].id),
                            description: d[i].description,
                            goal: parseFloat(d[i].goal),
                            delta: parseFloat(d[i].delta),
                            change_gap: parseInt(d[i].change_gap)
                        });
                    }
                    this.redrawTbl();
                    cursor_blocker.disable();
                    break;
                case this.ACTION.SAVE:
                    this.resetContProg();
                    break;
                case this.ACTION.RESET:
                    this.dataIniToData();
                    cursor_blocker.disable();
                    break;
                default:
                    console.log("confirm: unknown action: " + action);
                    break;
            }

        } catch (e) {
            alert("prog: confirm: " + e.message);
        }

    };
    this.abort = function (action, m, n) {
        try {
            switch (action) {
                case this.ACTION.GET:
                    logger.err(250);
                    cursor_blocker.disable();
                    break;
                case this.ACTION.SAVE:
                    logger.err(257);
                    cursor_blocker.disable();
                    break;
                case this.ACTION.RESET:
                    logger.err(255);
                    cursor_blocker.disable();
                    break;
                default:
                    console.log("abort: unknown action: " + action);
                    break;
            }
            cursor_blocker.disable();
        } catch (e) {
            alert("prog: abort: " + e.message);
        }
    };
    this.getDataItem = function (k1, k2) {
        try {
            for (var i = 0; i < this.data.length; i++) {
                if (this.data[i].id === k1 && this.data[i].seq === k2) {
                    return  this.data[i];
                }
            }
            return null;
        } catch (e) {
            alert("prog: getDataItem: " + e.message);
        }
    };
    this.redrawTbl = function () {
        try {
            this.last_sc = -1;
            this.last_sr = -1;
            this.t1.clear();
            for (var i = 0; i < this.data.length; i++) {
                this.t1.appendRow([
                    this.data[i].description,
                    this.data[i].goal.toFixed(this.FLOAT_PRS),
                    this.data[i].delta.toFixed(this.FLOAT_PRS),
                    intToTimeStr(this.data[i].change_gap)
                ]);
            }
        } catch (e) {
            alert("prog: redrawTbl: " + e.message);
        }
    };
    this.show = function () {
        try {
            clr(this.container, "hdn");
            document.title = this.getName();
            if (this.update) {
                this.getData();
            }
            this.visible = true;
        } catch (e) {
            alert("prog: show: " + e.message);
        }
    };
    this.hide = function () {
        try {
            cla(this.container, "hdn");
            this.visible = false;
        } catch (e) {
            alert("prog: hide: " + e.message);
        }
    };
}
var vedit_prog = new EditProg();
visu.push(vedit_prog);