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

var sStarted = null;
var sViewPort = null;
var sCurTabEl = null;
var sBlockedTabEl = null;
var sBaseAspect = null;

var sAloneWS    = null;
var sAloneRecID = null;

function pickAspect(aspect_id) {
    if (sViewPort > 0) {
        if (sBlockedTabEl != null && sBlockedTabEl.id == "la--" + aspect_id)
            return;
        window.parent.sTabPortData[sViewPort] = aspect_id;
        window.parent.updateTabCfg();
    } else {
        var cur_cnt_id = "a--" + aspect_id;
        tabcontent = document.getElementsByClassName("r-tabcnt");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].className = 
                (tabcontent[i].id == cur_cnt_id)? "r-tabcnt active":"r-tabcnt";
        }
        var cur_tab_id = "la--" + aspect_id;
        if (sCurTabEl == null || sCurTabEl.id != cur_tab_id) {  
            if (sCurTabEl != null) 
                sCurTabEl.className = sCurTabEl.className.replace(" active", "");
            sCurTabEl = document.getElementById(cur_tab_id);
            sCurTabEl.className += " active";
        }
    }
}

function tabCfgChange() {
    if (sViewPort < 1) 
        return;
    tab_port_data = window.parent.sTabPortData;
    tab_port_data[0] = !tab_port_data[0];
    window.parent.updateTabCfg();
}

function resetTabPort() {
    if (sViewPort < 1) 
        return;
    window.parent.sTabPortData[sViewPort] = sBaseAspect;
}

function updateCfg(reset_port) {
    var tab_port_data = window.parent.sTabPortData;
    if (sViewPort == null || tab_port_data[sViewPort] == null)
        return;
    document.getElementById("img-tab2").src = 
        tab_port_data[0]? "ui/images/tab2-exp.png": "ui/images/tab2-col.png";
    
    var cur_cnt_id = "a--" + tab_port_data[sViewPort];
    tabcontent = document.getElementsByClassName("r-tabcnt");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].className = 
            (tabcontent[i].id == cur_cnt_id)? "r-tabcnt active":"r-tabcnt";
    }
    if (sBlockedTabEl != null && (!tab_port_data[0] ||
            sBlockedTabEl.id != "la--" + tab_port_data[3 - sViewPort])) {
        sBlockedTabEl.disabled = false;
        sBlockedTabEl = null;
    }
    var cur_tab_id = "la--" + tab_port_data[sViewPort];
    if (sCurTabEl == null || sCurTabEl.id != cur_tab_id) {  
        if (sCurTabEl != null) 
            sCurTabEl.className = sCurTabEl.className.replace(" active", "");
        sCurTabEl = document.getElementById(cur_tab_id);
        sCurTabEl.className += " active";
    }
    if (sBlockedTabEl == null && tab_port_data[0] && 
            tab_port_data[1] != tab_port_data[2] &&
            tab_port_data[3 - sViewPort] != null) {
        sBlockedTabEl = document.getElementById(
            "la--" + tab_port_data[3 - sViewPort]);
        sBlockedTabEl.disabled = true;
    }        
}

function init_r(port, init_aspect, ws_name, rec_id) {
    sViewPort = port;
    sBaseAspect = init_aspect;
    if (sViewPort > 0) {
        tab_port_data = window.parent.sTabPortData;
        if ( tab_port_data[sViewPort] == null ) {
            tab_port_data[sViewPort] = init_aspect;
        }
    } else {
        sAloneWS = ws_name;
        sAloneRecID = rec_id;
        el = document.getElementById("img-wrap");
        el.innerHTML = "<b>Dataset</b>: " + ws_name + 
            "<br/><b>Variant</b>: " + rec_id;
        el.onclick = null;
        el.className = "info";
    }
    initTagsEnv();
    sStarted = true;
    if (sViewPort > 0) {
        window.parent.updateTabCfg();
    } else {
        pickAspect(sBaseAspect);
    }
    checkCohortCtrl();
    window.onclick = onClick;
}

function onClick(event_ms) {
    window.parent.onClick(event_ms);
}

function checkCohortCtrl() {
    if (!window.parent.sCohortList)
        return;
    var cohort_list = window.parent.sCohortList;
    add_rep = ['<br/><p>Cohort visibility:'];
    for (idx = 0; idx < cohort_list.length; idx++) {
        c_name = cohort_list[idx];
        add_rep.push('<input id="__cohort__check_' + c_name + 
            '" type="checkbox" onchange="_checkCohorts();"/><label ' +
            'for="__cohort__check_' + c_name + '">&nbsp;' + c_name + '</label>');
    }
    add_rep.push('</p>');    
    document.getElementById('a--view_cohorts').innerHTML += add_rep.join('\n');
    refreshCohorts();
}

function refreshCohorts() {
    var cohort_list = window.parent.sCohortList;
    for (idx = 0; idx < cohort_list.length; idx++) {
        check_it = window.parent.sCohortViewCheck[cohort_list[idx]];
        document.getElementById(
            '__cohort__check_' + cohort_list[idx]).checked = check_it;
        seq_el = document.getElementsByClassName("cohorts_" + cohort_list[idx]);
        for (j = 0; j < seq_el.length; j++)
            seq_el[j].style.display = (check_it)? "": "none";
    }
}

function _checkCohorts() {
    var cnt = 0;
    var cohort_list = window.parent.sCohortList;
    for (idx = 0; idx < cohort_list.length; idx++) {
        c_name = cohort_list[idx];
        check_it = document.getElementById('__cohort__check_' + c_name).checked;
        window.parent.sCohortViewCheck[c_name] = check_it;
        if (check_it)
            cnt += 1;
    }
    if (cnt == 0) {
        window.parent.sCohortViewCheck[cohort_list[0]] = true;
    }
    window.parent.refreshCohorts();
}