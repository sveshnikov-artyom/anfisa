/*
 * Copyright (c) 2019. Partners HealthCare and other members of
 * Forome Association
 *
 * Developed by Sergey Trifonov based on contributions by Joel Krier,
 * Michael Bouzinier, Shamil Sunyaev and other members of Division of
 * Genetics, Brigham and Women's Hospital
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/**************************************/
/* Filtering base support: units, stats, etc.
 * Used in all main regimes: 
 * WS/XL-Filter/XL-Tree
/**************************************/
var sOpNumH = {
    mInfo: null,
    mInputMin: null,
    mInputMax: null,
    mSpanSigns: null,
    mUpdateCondStr: null,

    init: function() {
        this.mInputMin   = document.getElementById("cond-min-inp");
        this.mInputMax   = document.getElementById("cond-max-inp");
        this.mSpanSigns = [document.getElementById("cond-min-sign"),
            document.getElementById("cond-max-sign")];
    },
    
    getCondType: function() {
        return "numeric";
    },

    suspend: function() {
        this.mInfo = null;
        this.careControls();
    },
    
    updateUnit: function(unit_stat) {
        this.mUpdateCondStr = null;
        this.mInfo = {
            cur_bounds: [null, true, null, true],
            unit_type:  unit_stat["sub-kind"],
            val_min:    unit_stat["min"],
            val_max:    unit_stat["max"],
            count:      unit_stat["count"]}
            
        if (this.mInfo.val_min != null) {
            document.getElementById("cond-min").innerHTML = 
                normFloatLongTail(this.mInfo.val_min);
            document.getElementById("cond-max").innerHTML = 
                normFloatLongTail(this.mInfo.val_max, true);
            sign_val = (this.mInfo.val_min == this.mInfo.val_max)? "=": "&le";
        } else {
            document.getElementById("cond-min").innerHTML = "?";
            document.getElementById("cond-max").innerHTML = "?";
            sign_val = "?"
        }
        this.mInputMin.value = "";
        this.mInputMax.value = "";
        this.mSpanSigns[0].innerHTML = sign_val;
        this.mSpanSigns[0].className = "num-sign-disabled";
        this.mSpanSigns[1].innerHTML =sign_val;
        this.mSpanSigns[1].className = "num-sign-disabled";
    },

    updateCondition: function(cond) {
        this.mUpdateCondStr = JSON.stringify(cond.slice(2));
        this.mInfo.cur_bounds   = cond[2].slice();
        this.mInputMin.value = (this.mInfo.cur_bounds[0] != null)?
            this.mInfo.cur_bounds[0] : "";
        this.mInputMax.value = (this.mInfo.cur_bounds[2] != null)?
            this.mInfo.cur_bounds[2] : "";
    },

    switchSign: function(idx) {
        if (this.mSpanSigns[idx].className == "num-sign-disabled")
            return;
        this.mInfo.cur_bounds[1 + 2 * idx] = 
            !this.mInfo.cur_bounds[1 + 2 * idx];
        this.mSpanSigns[idx].innerHTML = 
            this.mInfo.cur_bounds[1 + 2 * idx]? "&le;" : "&lt;";
        this.checkControls();
    },
    
    careControls: function() {
        document.getElementById("cur-cond-numeric").style.display = 
            (this.mInfo == null)? "none":"block";
    },

    checkControls: function(opt) {
        if (this.mInfo == null) 
            return;
        var err_msg = null;
        if (this.mInputMin.value.trim() == "") {
            this.mInfo.cur_bounds[0] = null;
            this.mInputMin.className = "num-inp";
        } else {
            val = toNumeric(this.mInfo.unit_type, this.mInputMin.value)
            this.mInputMin.className = (val == null)? "num-inp bad":"num-inp";
            if (val == null) 
                err_msg = "Bad numeric value";
            else {
                this.mInfo.cur_bounds[0] = val;
            }
        }
        if (this.mInputMax.value.trim() == "") {
            this.mInfo.cur_bounds[2] = null;
            this.mInputMax.className = "num-inp";
        } else {
            val = toNumeric(this.mInfo.unit_type, this.mInputMax.value)
            this.mInputMax.className = (val == null)? "num-inp bad":"num-inp";
            if (val == null) 
                err_msg = "Bad numeric value";
            else {
                this.mInfo.cur_bounds[2] = val;
            }
        }
        
        if (this.mInfo.cur_bounds[0] != null && err_msg == null &&
                this.mInfo.cur_bounds[0] == this.mInfo.cur_bounds[2] &&
                (this.mInfo.cur_bounds[1] | this.mInfo.cur_bounds[3])) {
            err_msg = "Out of choice: strict bounds";
        }

        this.mSpanSigns[0].innerHTML = this.mInfo.cur_bounds[1]? "&le;" : "&lt;";
        this.mSpanSigns[1].innerHTML = this.mInfo.cur_bounds[3]? "&le;" : "&lt;";
        this.mSpanSigns[0].className = (this.mInfo.cur_bounds[0] == null)?
            "num-sign-disabled" : "num-sign";
        this.mSpanSigns[1].className = (this.mInfo.cur_bounds[2] == null)?
            "num-sign-disabled" : "num-sign";        
        
        condition_data = null;
        if (err_msg == null) {
            condition_data = [this.mInfo.cur_bounds];
            if (this.mInfo.cur_bounds[0] == null && 
                    this.mInfo.cur_bounds[2] == null)
                err_msg = "";
            if (this.mInfo.val_min != null) {
                if (this.mInfo.cur_bounds[0] != null) {
                    if (this.mInfo.cur_bounds[0] > this.mInfo.val_max)
                        err_msg = "Lower bound is above maximum value";
                    if (this.mInfo.cur_bounds[0] < this.mInfo.val_min) 
                        err_msg = "Lower bound is below minimal value";
                }
                if (this.mInfo.cur_bounds[2] != null) {
                    if (this.mInfo.cur_bounds[2] < this.mInfo.val_min) 
                        err_msg = "Upper bound is below minimum value";
                    if (this.mInfo.cur_bounds[2] > this.mInfo.val_max)
                        err_msg = "Upper bound is above maximal value";
                }
            } else {
                err_msg = "Out of choice"
            }
            if (err_msg && this.mUpdateCondStr == null)
                condition_data = null;
            if (this.mInfo.cur_bounds[0] != null && 
                    this.mInfo.cur_bounds[2] != null && 
                    this.mInfo.cur_bounds[0] > this.mInfo.cur_bounds[2]) {
                err_msg = "Bounds are mixed up";
                condition_data = null;
            }
        }
        if (this.mUpdateCondStr && !err_msg && condition_data &&
                JSON.stringify(condition_data) == this.mUpdateCondStr) {
            err_msg = " ";
            condition_data = null;
        }
        sOpCondH.formCondition(condition_data, err_msg, this.mInfo.op, false);
        this.careControls();
    }
};

/**************************************/
var sOpEnumH = {
    mVariants: null,
    mOperationMode: null,
    mDivVarList: null,
    mSpecCtrl: null,
    mStatusMode: null,
    mUpdateCondStr: null,
    mDivZygPGroup: null,

    init: function() {
        this.mDivVarList = document.getElementById("op-enum-list");
        this.mDivZygPGroup = document.getElementById("cur-cond-zyg-problem-group");
        sZygosityH.init(!!this.mDivZygPGroup);
    },
    
    getCondType: function() {
        if (this.mSpecCtrl != null)
            return this.mSpecCtrl.getCondType();
        return "enum";
    },
    
    suspend: function() {
        this.mVariants = null;
        this.mOperationMode = null;
        this.careControls();
    },
    
    readyForCondition: function(unit_stat, condition) {
        if (unit_stat["kind"] == "func")
            return sZygosityH.readyForCondition(unit_stat, condition);
        return true;
    },

    reprVariant: function(var_name, var_count, var_idx, is_checked) {
        var check_id = 'elcheck--' + var_idx; 
        return '<div class="enum-val' + 
            ((var_count==0)? " zero":"") +'">' +
            '<input id="' + check_id + '" type="checkbox" ' + 
            ((is_checked)? 'checked ':'') + 
            'onchange="sOpEnumH.checkControls();"/><label for="' +
            check_id + '">&emsp;' + var_name + 
            '<span class="enum-cnt">(' + var_count + ')</span></div>';
    },
    
    updateUnit: function(unit_stat) {
        this.mUpdateCondStr = null;
        if (unit_stat["kind"] == "func") {
            return;
            this.mSpecCtrl = sZygosityH;
            this.mVariants = []; //TRFsZygosityH.setupVariants(unit_stat, this.mDivZygPGroup);
            this.mOperationMode = null;
            this.mStatusMode = null;
        } else {
            this.mVariants = unit_stat["variants"];
            this.mOperationMode = 0;
            this.mStatusMode = (unit_stat["sub-kind"] == "status");
            this.mSpecCtrl = null;
            if (this.mDivZygPGroup) {
                this.mDivZygPGroup.style.display = "none";
            }
        }
        
        list_val_rep = [];
        has_zero = false;
        for (j = 0; j < this.mVariants.length; j++) {
            var_name = this.mVariants[j][0];
            var_count = this.mVariants[j][1];
            if (unit_stat["detailed"] && var_count > 0)
                var_count = var_count + "/" + this.mVariants[j][2];
            has_zero |= (var_count == 0);
            list_val_rep.push(this.reprVariant(var_name, var_count, j));
        }
        this.mDivVarList.innerHTML = list_val_rep.join('\n');
        this.mDivVarList.className = "";
        
        document.getElementById("cur-cond-enum-zeros").style.display = 
            (has_zero)? "block":"none";            
        this.careEnumZeros(false);
    },
    
    updateCondition: function(cond) {
        this.mUpdateCondStr = JSON.stringify(cond.slice(2));
        if (this.mSpecCtrl != null) {
            this.mSpecCtrl = sZygosityH;
            var_list = this.mSpecCtrl.getCondVarList(cond);
            op_mode = this.mSpecCtrl.getCondOpMode(cond);
        } else {
            var_list = cond[3];
            op_mode = cond[2];
        }
        if (this.mOperationMode != null)
            this.mOperationMode = ["OR", "AND", "NOT"].indexOf(op_mode);
        needs_zeros = false;
        if (var_list) {
            present_vars = {};
            for (j = 0; j < this.mVariants.length; j++) {
                var_name = this.mVariants[j][0];
                if (var_list.indexOf(var_name) < 0)
                    continue
                present_vars[var_name] = true;
                needs_zeros |= (this.mVariants[j][1] == 0);
                document.getElementById("elcheck--" + j).checked = true;
            }
            lost_vars = [];
            for (j=0; j < var_list.length; j++)  {
                var_name = var_list[j];
                if (!present_vars[var_name])
                    lost_vars.push(var_name);
            }
            if(lost_vars.length > 0) {
                list_val_rep = [];
                lost_vars.sort();
                for (j=0; j < lost_vars.length; j++)  {
                    var_name = lost_vars[j];
                    this.mDivVarList.innerHTML += this.reprVariant(
                        var_name, 0, this.mVariants.length, true);
                    this.mVariants.push([var_name, 0, 0]);
                }
                needs_zeros = true;
            }
        }
        this.careEnumZeros(needs_zeros);
        this.checkControls();
    },
    
    careControls: function() {
        document.getElementById("cur-cond-enum").style.display = 
            (this.mVariants == null)? "none":"block";
        for (idx = 1; idx < 3; idx++) {
            vmode = ["or", "and", "not"][idx];
            document.getElementById("cond-mode-" + vmode + "-span").
                style.visibility = (this.mOperationMode == null ||
                    (this.mStatusMode && idx != 2))? "hidden":"visible";
            document.getElementById("cond-mode-" + vmode).checked =
                (idx == this.mOperationMode);
        }
    },

    careEnumZeros: function(opt) {
        var check_enum_z = document.getElementById("cur-enum-zeros");
        if (opt == undefined) {
            show_zeros = check_enum_z.checked;
        } else {
            show_zeros = opt;
            check_enum_z.checked = show_zeros;
        }
        this.mDivVarList.className = (show_zeros)? "":"no-zeros";
    },
    
    checkControls: function(opt) {
        if (this.mVariants == null) 
            return;
        this.careControls();
        var err_msg = null;
        if (opt != undefined && this.mOperationMode != null) {
            if (this.mOperationMode == opt)
                this.mOperationMode = 0;
            else
                this.mOperationMode = opt;
        }
        sel_names = [];
        for (j=0; j < this.mVariants.length; j++) {
            if (document.getElementById("elcheck--" + j).checked)
                sel_names.push(this.mVariants[j][0]);
        }
        op_mode = "";
        if (this.mOperationMode != null)
            op_mode = ["", "AND", "NOT"][this.mOperationMode];
        if (!op_mode)
            op_mode = "";
        
        condition_data = null;
        if (sel_names.length > 0) {
            condition_data = [op_mode, sel_names];
            if (sel_names.length == 1)
                err_msg = "1 variant selected";
            else
                err_msg = sel_names.length + " variants selected";
        } else
            err_msg = " Out of choice"
        if (this.mSpecCtrl != null) {
            condition_data = this.mSpecCtrl.transCondition(condition_data);
            err_msg = this.mSpecCtrl.checkError(condition_data, err_msg);
        }
        if (this.mUpdateCondStr && !err_msg && condition_data &&
                JSON.stringify(condition_data) == this.mUpdateCondStr) {
            err_msg = " ";
            condition_data = null;
        }

        sOpCondH.formCondition(condition_data, err_msg, op_mode, true);
        this.careControls();
    },
    
    waitForUpdate: function(unit_name) {
        this.mDivVarList.className = "wait";
    }
};

/**************************************/
var sOpImportH = {
    mUnitName: null,

    getCondType: function() {
        return "import";
    },

    suspend: function() {
        this.mUnitName = null;
        this.careControls();
    },
    
    updateUnit: function(unit_stat) {
        this.mUnitName = unit_stat["name"]
    },

    updateCondition: function(cond) {
        this.mUnitName = cond[1];
    },

    careControls: function() {
        document.getElementById("cur-cond-import").style.display = 
            (this.mUnitName == null)? "none":"block";
    },

    checkControls: function(opt) {
        if (this.mUnitName == null) 
            return;
        sOpCondH.formCondition([], "", null, false);
        this.careControls();
    }
};

/**************************************/
/**************************************/
function zygCaseReportValues(zyg_case, list_stat_rep) {
    if (zyg_case.mStat == null) {
        list_stat_rep.push('<span class="stat-bad">Determine problem group</span>');
        return;
    } 
    if (zyg_case.mSize == 0) {
        list_stat_rep.push('<span class="stat-bad">Out of choice</span>');
        return;
    }
    list_stat_rep.push('<ul>');
    for (var j = 0; j < zyg_case.mStat.length; j++) {
        var_name = zyg_case.mStat[j][0];
        var_count = zyg_case.mStat[j][1];
        if (var_count == 0)
            continue;
        list_stat_rep.push('<li><b>' + var_name + '</b>: ' + 
            reportStatCount(zyg_case.mStat[j], zyg_case.mUnitStat) + '</li>');
    }
}
        
function zygStatCheckError(zyg_stat, err_msg) {
    if (zyg_stat.mStat == null)
        return " Determine problem group";
    if (zyg_stat.mSize == 0)
        return "Out of choice";
    return err_msg;
}

/**************************************/
function newZygCase(base, unit_stat, mode_op) {
    var size = 0;
    if (unit_stat["variants"]) {
        for (var j = 0; j < unit_stat["variants"].length; j++) {
            if (unit_stat["variants"][j][1] > 0)
                size++;
        }
    }    
    return {
        mBase: base,
        mModeOp: mode_op,
        mUnitStat: unit_stat,
        mProblemIdxs: (unit_stat["problem-group"] == null)? 
            this.mBase.mDefaultIdxs:unit_stat["problem-group"],
        mStat: unit_stat["variants"],
        mSize: size
    };
}

function zygCaseSameCase(zyg_case, problem_idxs) {
    if (problem_idxs == null) 
        return (zygCaseProblemIdxs(zyg_case, true) == null);
    return problem_idxs.join(',') == zyg_case.mProblemIdxs.join(',');
}


function zygCaseProblemIdxs(zyg_case, check_default) {
    if (check_default && zyg_case.mBase.mDefaultRepr == zyg_case.mProblemIdxs.join(','))
        return null;
    return zyg_case.mProblemIdxs.slice();
}
        
function zygCaseFilIt(zyg_case, list_stat_rep) {
    if (zyg_case.mModeOp && zyg_case.mBase.mSeparateOp) {
        id_prefix = "zyg-fam-op-m__";
        button_id = "zyg-fam-op-reset";
        mode_op = 1;
    } else {
        id_prefix = "zyg-fam-m__";
        button_id = "zyg-fam-reset";
        mode_op = 0;
    }
    list_stat_rep.push('<div class="zyg-family">');
    for (var idx = 0; idx < zyg_case.mBase.mFamily.length; idx++) {
        q_checked = (zyg_case.mProblemIdxs.indexOf(idx)>=0)? " checked":"";
        check_id = id_prefix + idx;
        list_stat_rep.push('<div class="zyg-fam-member">' + 
            '<input type="checkbox" id="' + check_id + '" ' + q_checked + 
            ' onchange="sZygosityH.loadCase(' + mode_op + ');" /><label for="' +
            check_id + '">&nbsp;' + zyg_case.mBase.mFamily[idx] + '</div>');
    }
    list_stat_rep.push('</div>');
    if (zyg_case.mBase.mDefaultIdxs.length > 0) {
        reset_dis = (zygCaseProblemIdxs(zyg_case, true) == null)? 'disabled="true"':'';
        list_stat_rep.push('<button id="' + button_id + '"' +
            ' title="Reset affected group" ' + reset_dis + 
            ' onclick="sZygosityH.resetGrp(' + mode_op + ')">Reset</button>');
    }
}

/**************************************/
var sZygosityH = {
    mSeparateOp: false,
    mUnitName: null,
    mFamily: null,
    mDefaultIdxs: null,
    mDefaultRepr: null,
    mCases: [null, null],
    mWaitIdxs: [null, null],
    mTimeH: null,
    mOpBaseUnitStat: null,
    mOpBaseCondition: null,
    mOpSetUp: null,
    
    init: function(separate_op) {
        this.mSeparateOp = separate_op;
    },
    
    _baseSetup: function(unit_stat) {
        this.mUnitName = unit_stat["name"];
        this.mFamily = unit_stat["family"];
        this.mDefaultIdxs = unit_stat["affected"];
        this.mDefaultRepr = this.mDefaultIdxs.join(',');
    },
    
    readyForCondition: function(unit_stat, condition_data) {
        if (!this.mSeparateOp)
            return true;
        if (this.mOpBaseUnitStat == unit_stat && condition_data == this.mOpBaseCondition)
            return true;
        this.mOpSetUp = false;
        this.mOpBaseUnitStat = unit_stat;
        this.mOpBaseCondition = condition_data;
        if (this.mUnitName == null) {
            this._baseSetup(unit_stat);
        }
        var cond_problem_idxs = condition_data[2];
        if (JSON.stringify(cond_problem_idxs) == JSON.stringify(unit_stat[2])) {
            this.mCases[1] = newZygCase(this, unit_stat, 1);
            return true;
        }
        this.reload(1, (cond_problem_idxs == null)? this.mDefaultIdxs:cond_problem_idxs);
        return false;
    },
    
    setup: function(unit_stat, list_stat_rep) {
        if (this.mTimeH) {
            clearInterval(this.mTimeH);
            this.mTimeH = null;
        }
        this._baseSetup(unit_stat);
        this.mCases[0] = newZygCase(this, unit_stat, 0);
        if (this.mSeparateOp && this.mOpBaseUnitStat) {
            if (JSON.stringify(unit_stat) != JSON.stringify(this.mOpBaseUnitStat)) {
                this.mOpBaseUnitStat = null;
                this.mOpBaseCondition = null;
                this.mCases[1] = null;
            } else 
                this.mOpBaseUnitStat = unit_stat;
        }
            
        list_stat_rep.push('<div id="zyg-wrap">');
        list_stat_rep.push('<div id="zyg-problem">');
        zygCaseFilIt(this.mCases[0], list_stat_rep);
        list_stat_rep.push('</div>');
        list_stat_rep.push('<div id="zyg-stat">');
        zygCaseReportValues(this.mCases[0], list_stat_rep);
        list_stat_rep.push('</div></div>');
        sUnitsH.setCtxPar("problem_group", zygCaseProblemIdxs(this.mCases[0]))
    },    
    
    getCondType: function() {
        return "zygosity";
    },
    
    setupVariants: function(unit_stat, div_pgroup) {
        var mode_op = (this.mSeparateOp)? 1:0;
        if (div_pgroup && !this.mOpSetUp) {
            list_stat_rep = [];
            zygCaseFilIt(this.mCases[mode_op], list_stat_rep);
            div_pgroup.innerHTML = list_stat_rep.join('\n');
            div_pgroup.style.display = "flex";
            if (this.mSeparateOp)
                this.mOpSetUp = true;
        }
        return null; //TRF!!!
        if (this.mCases[mode_op].mStat == null)
            return [];
        return this.mCases[mode_op].mStat;
    },
    
    transCondition: function(condition_data) {
        if (condition_data == null)
            return null;
        ret = condition_data.slice();
        ret.splice(0, 0, zygCaseProblemIdxs(this.mCases[(this.mSeparateOp)? 1:0], true));
        return ret;
    },
    
    checkError: function(condition_data, err_msg) {
        return zygStatCheckError(this.mCases[(this.mSeparateOp)? 1:0], err_msg);
    },
    
    getUnitTitle: function(problem_idxs) {
        if (problem_idxs == null) 
            return this.mUnitName + '()';
        var problem_repr = problem_idxs.join(',');
        if (problem_repr == this.mDefaultRepr)
            return this.mUnitName + '()';        
        return this.mUnitName + '({' + problem_repr + '})';        
    },
    
    checkUnitTitle: function(unit_name) {
        if (unit_name != this.mUnitName)
            return null;
        return this.getUnitTitle();
    },
    
    getCondOpMode: function(condition_data) {
        return condition_data[3];
    },
    
    getCondVarList: function(condition_data) {
        return condition_data[4];
    },
    
    onSelectCondition: function(condition_data) {
        if (condition_data[1] != this.mUnitName)
            return;
        this.reSelect(0, condition_data[2]);
        this.loadCase(0);
    },
    
    resetGrp: function(mode_op) {
        this.reSelect(mode_op, this.mDefaultIdxs);
        this.loadCase(mode_op);
    },

    reSelect: function(mode_op, problem_idxs) {
        if (problem_idxs == null)
            problem_idxs = this.mDefaultIdxs;
        var id_prefix = (mode_op)?"zyg-fam-op-m__" : "zyg-fam-m__";
        for (var idx = 0; idx < this.mFamily.length; idx++)
            document.getElementById(id_prefix + idx).checked =
                (problem_idxs.indexOf(idx) >= 0);
    },
    
    collectIdxs: function(mode_op) {
        var id_prefix = (mode_op)?"zyg-fam-op-m__" : "zyg-fam-m__";
        var problem_idxs = [];
        for (var idx = 0; idx < this.mFamily.length; idx++) {
            if (document.getElementById(id_prefix + idx).checked)
                problem_idxs.push(idx);
        }
        return problem_idxs;
    },
    
    loadCase: function(mode_op) {
        if (this.mTimeH == null)
            this.mTimeH = setInterval(function(){sZygosityH.reload(mode_op);}, 30)
        document.getElementById((mode_op)? "zyg-fam-op-reset":"zyg-fam-reset").disabled = 
            zygCaseProblemIdxs(this.mCases[mode_op], true) == null;
    },

    reload: function(mode_op, problem_idxs) {
        clearInterval(this.mTimeH);
        this.mTimeH = null;
        var check_same = true;
        if (problem_idxs == undefined) 
            var problem_idxs = this.collectIdxs(mode_op);
        else
            check_same = false;
        if (check_same && this.mCases[mode_op] && 
                zygCaseSameCase(this.mCases[mode_op], problem_idxs)) {
            if (this.mCases[1 - mode_op] == null) 
                return;
            problem_idxs = this.collectIdxs(1 - mode_op);
            if (zygCaseSameCase(this.mCases[1-mode_op], problem_idxs))
                return;
            mode_op = 1 - mode_op;
        }
        if (mode_op == 0) {
            sUnitsH.setCtxPar("problem_group", problem_idxs);
            document.getElementById("stat-data--" + this.mUnitName).className = "wait";
        }
        if (mode_op || !self.mSeparateOp) 
            document.getElementById("zyg-stat").className = "wait";
        var args = sUnitsH.getRqArgs(mode_op == 1) + 
            "&units=" + encodeURIComponent(JSON.stringify([this.mUnitName]));
        sOpEnumH.waitForUpdate();
        if (mode_op == 1) {
            args += "&ctx=" + encodeURIComponent(
                JSON.stringify({"problem_group": problem_idxs}));
        }
        ajaxCall("statunits", args, 
            function(info){sZygosityH._reload(info, mode_op);})
    },
    
    _reload: function(info, mode_op) {
        var unit_stat = info["units"][0];
        this.mCases[mode_op] = newZygCase(this, unit_stat, mode_op);
        if (mode_op == 0) {
            rep_list = [];
            zygCaseReportValues(this.mCases[0], rep_list);
            zyg_div = document.getElementById("zyg-stat");
            zyg_div.innerHTML = rep_list.join('\n');
            zyg_div.className = "";
            sUnitsH.updateZygUnit(this.mUnitName, unit_stat);
            if (!self.mSeparateOp) 
                refillUnitStat(unit_stat);
        } else {
            updateZygCondStat(this.mUnitName);
        }
        if (this.mCases[1 - mode_op])
            this.loadCase(1-mode_op);
    }
};

/*************************************/
/*************************************/
function fillStatList(items, unit_map, list_stat_rep, 
        unit_names_to_load, expand_mode) {
    var group_title = false;
    for (idx = 0; idx < items.length; idx++) {
        unit_stat = items[idx];
        unit_name   = unit_stat["name"];
        unit_map[unit_name] = idx;
        if (group_title != unit_stat["vgroup"] || unit_stat["vgroup"] == null) {
            if (group_title != false) {
                list_stat_rep.push('</div>');
            }
            group_title = unit_stat["vgroup"];
            list_stat_rep.push('<div class="stat-group">');
            if (group_title != null) {
                list_stat_rep.push('<div class="stat-group-title">' + 
                    group_title);
                if (unit_name == "Rules") {
                    list_stat_rep.push(
                        '<span id="flt-go-dtree" ' +
                            'title="Configure decision trees as rules..." ' +
                        'onclick="goToPage(\'DTREE\');"">&#9874;</span>')
                }
                list_stat_rep.push('</div>');
            }
        }
        func_decor = (unit_stat["kind"] == "func" || 
            unit_stat["sub-kind"] == "func")? "(...)":"";
        list_stat_rep.push('<div id="stat--' + unit_name + '" class="stat-unit" ');
        if (unit_stat["tooltip"]) 
            list_stat_rep.push('title="' + escapeText(unit_stat["tooltip"]) + '" ');

        list_stat_rep.push('onclick="sUnitsH.selectUnit(\'' + unit_name + '\');">');
        list_stat_rep.push('<div class="wide"><span class="stat-unit-name">' +
            unit_name + func_decor + '</span>');
        if (unit_stat["title"]) 
            list_stat_rep.push('<span class="stat-unit-title">' + 
                unit_stat["title"] + '</span>');
        list_stat_rep.push('</div>')
        list_stat_rep.push('<div id="stat-data--' + unit_name + '" class="stat-unit-data">');
        if (unit_stat["incomplete"]) {
            unit_names_to_load.push(unit_name);
            list_stat_rep.push('<div class="comment">Loading data...</div>');
        } else {
            switch (unit_stat["kind"]) {
                case "numeric":
                    fillStatRepNum(unit_stat, list_stat_rep);
                    break;
                case "enum":
                case "transcript":
                    fillStatRepEnum(unit_stat, list_stat_rep, expand_mode);
                    break;
                case "func":
                    break;
                case "inactive":
                    list_stat_rep.push('<div class="comment">Not imported</div>');
                    break;
            }
        }
        list_stat_rep.push('</div></div>')
    }
    if (group_title != false) {
        list_stat_rep.push('</div>')
    }
}

function refillUnitStat(unit_stat, expand_mode) {
    div_el = document.getElementById("stat-data--" + unit_stat["name"]);
    list_stat_rep = [];
    if (unit_stat["kind"] == "func") 
        sZygosityH.setup(unit_stat, list_stat_rep);
    else {
        if (unit_stat["kind"] == "numeric") 
            fillStatRepNum(unit_stat, list_stat_rep);
        else
            fillStatRepEnum(unit_stat, list_stat_rep, expand_mode);
    }
    div_el.innerHTML = list_stat_rep.join('\n');
    div_el.className = "";
}

function exposeEnumUnitStat(unit_stat, expand_mode) {
    list_stat_rep = [];
    fillStatRepEnum(unit_stat, list_stat_rep, expand_mode);
    div_el = document.getElementById("stat-data--" + unit_stat["name"]);
    div_el.innerHTML = list_stat_rep.join('\n');
}

function topUnitStat(unit_name) {
    return document.getElementById(
        "stat--" + unit_name).getBoundingClientRect().top;
}

/**************************************/
function getCondDescription(cond, short_form) {
    if (cond == null)
        return "";
    if (cond != null && cond[0] == "numeric") {
        rep_cond = [];
        if (cond[2][0] != null)
            rep_cond.push(cond[2][0] + "&nbsp;&le;");
        rep_cond.push(cond[1]);
        if (cond[2][1] != null)
            rep_cond.push("&le;&nbsp;" + cond[2][1]);
        return rep_cond.join(" ");
    }
    rep_var = (short_form)? "":cond[1];
    if (cond[0] == "enum") {
        op_mode = cond[2];
        sel_names = cond[3];
    } else {
        if (cond[0] == "zygosity") {
            op_mode = cond[3];
            sel_names = cond[4];
            if (!short_form)
                rep_var = sZygosityH.getUnitTitle(cond[2]);
        }
        else {
            if (cond[0] == "import")
                return "import " + cond[1];
            console.log("Bad cond:" + JSON.stringify(cond));
            return "???";
        }
    }
    var selection = [];
    for (j=0; j<sel_names.length; j++) {
        if (/^[A-Za-z0-9_]+$/u.test(sel_names[j]))
            selection.push(sel_names[j]);
        else
            selection.push('"' + sel_names[j] + '"');
    }
    selection = '{' + selection.join(', ') + '}';
    
    switch(op_mode) {
        case "NOT":
            rep_cond = rep_var + '&nbsp;not&nbsp;in&nbsp;' + selection;
            break;
        case "AND":
            rep_cond = rep_var + '&nbsp;in&nbsp;all(' + selection + ')';
            break;
        default:
            rep_cond = rep_var + '&nbsp;in&nbsp;' + selection;
    }
    if (short_form && rep_cond.length > 80)
        return rep_cond.substr(0, 77) + '...';
    return rep_cond
}

/*************************************/
function fillStatRepNum(unit_stat, list_stat_rep) {
    val_min   = unit_stat["min"];
    val_max   = unit_stat["max"];
    count     = unit_stat["count"];
    if (count == 0) {
        list_stat_rep.push('<span class="stat-bad">Out of choice</span>');
    } else {
        if (val_min == val_max) {
            list_stat_rep.push('<span class="stat-ok">' + normFloatLongTail(val_min) + 
                '</span>');
        } else {
            list_stat_rep.push('<span class="stat-ok">' + normFloatLongTail(val_min) + 
                ' &le;&nbsp;...&nbsp;&le; ' + normFloatLongTail(val_max, true) + ' </span>');
        }
        list_stat_rep.push(': ' + reportStatCount([null, count], unit_stat));
    }
}

/*************************************/
function fillStatRepEnum(unit_stat, list_stat_rep, expand_mode) {
    var_list = unit_stat["variants"];
    list_count = 0;
    if (var_list) {
        for (j = 0; j < var_list.length; j++) {
            if (var_list[j][1] > 0)
                list_count++;
        }
    }
    if (list_count == 0) {
        list_stat_rep.push('<span class="stat-bad">Out of choice</span>');
        return;
    }
    needs_expand = list_count > 6 && expand_mode;
    if (expand_mode == 2) 
        view_count = list_count
    else
        view_count = (list_count > 6)? 3: list_count; 
        
    if (list_count > 6 && expand_mode) {
        list_stat_rep.push('<div onclick="exposeEnum(\'' + 
            unit_stat["name"] +  '\',' + (3 - expand_mode) + 
            ');" class="enum-exp">' + 
            ((expand_mode==1)?'+':'-') + '</div>');
    }
    list_stat_rep.push('<ul>');
    for (j = 0; j < var_list.length && view_count > 0; j++) {
        var_name = var_list[j][0];
        var_count = var_list[j][1];
        if (var_count == 0)
            continue;
        view_count -= 1;
        list_count--;
        list_stat_rep.push('<li><b>' + var_name + '</b>: ' + 
            reportStatCount(var_list[j], unit_stat) + '</li>');
    }
    list_stat_rep.push('</ul>');
    if (list_count > 0) {
        list_stat_rep.push('<p class="stat-comment">...and ' + 
            list_count + ' variants more...</p>');
    }
}

function reportStatCount(count_info, unit_stat) {
    if (unit_stat["detailed"]) {
        cnt_rep = count_info[1] + '(' + count_info[2] + ')';
        nm = "transcript";
    } else {
        cnt_rep = count_info[1];
        nm = "variant";
    }
    return '<span class="stat-count">' + cnt_rep + ' ' + nm +  
        ((count_info[1]>1)? 's':'') + '</span>';
}
