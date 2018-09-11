var sTagsInfo      = null;
var sTagOrder      = null;
var sCurTagIdx     = null;
var sTagNameOK     = null;
var sTagCntMode    = null;
var sTagCntChanged = null;
var sTimeH         = null;
var sPrevTag       = null;

var sBtnNewTag    = null;
var sBtnSaveTag   = null;
var sBtnCancelTag = null;
var sBtnDeleteTag = null;
var sBtnUndoTag   = null;
var sBtnRedoTag   = null;
var sInpTagName   = null;
var sInpTagValue  = null;
var sInpTagNameList = null;

function initTagsEnv() {
    sBtnNewTag      = document.getElementById("tg-tag-new"); 
    sBtnCreateTag   = document.getElementById("tg-tag-create"); 
    sBtnSaveTag     = document.getElementById("tg-tag-save"); 
    sBtnCancelTag   = document.getElementById("tg-tag-cancel"); 
    sBtnDeleteTag   = document.getElementById("tg-tag-delete"); 
    sBtnUndoTag     = document.getElementById("tg-tag-undo"); 
    sBtnRedoTag     = document.getElementById("tg-tag-redo"); 
    sInpTagName     = document.getElementById("tg-tag-name"); 
    sInpTagValue    = document.getElementById("tg-tag-value-content");
    sInpTagNameList = document.getElementById("tg-tags-tag-list");
    loadTags(null);
}

function loadTags(tags_to_update){
    if (sViewPort > 0) {
        if (parent.window.sCurRecID == null)
            return;
        ws_name = parent.window.sWorkspaceName;
        rec_id = parent.window.sCurRecID;
        app_modes = parent.window.sAppModes;
    } else {
        ws_name = sAloneWS;
        rec_id = sAloneRecID;
        app_modes = "";
    }
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var info = JSON.parse(this.responseText);
            setupTags(info);
        }
    };
    xhttp.open("POST", "tags", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    args = "ws=" + ws_name +  "&m=" + encodeURIComponent(app_modes) + 
        "&rec=" + rec_id;
    if (tags_to_update) 
        args += "&tags=" + encodeURIComponent(JSON.stringify(tags_to_update)); 
    xhttp.send(args); 
}

function setupTags(info) {
    sTagsInfo  = info;
    sCurTagIdx = null;
    
    var el = document.getElementById("tg-filters-list");
    if (sTagsInfo["filters"]) {
        el.innerHTML = sTagsInfo["filters"].join(' ');
        el.className = "";
    } else {
        el.innerHTML = "none";
        el.className = "empty";
    }

    sTagOrder = [];
    for(var tag in info["tags"]) {
        sTagOrder.push(tag);
    }
    sTagOrder.sort();
    var rep = [];
    for (idx = 0; idx < sTagOrder.length; idx++) {
        rep.push('<div id="tag--' + idx + '" class="tag-label" ' +
            'onclick="pickTag(' + idx + ');">' + sTagOrder[idx] + '</div>');
    }
    document.getElementById("tg-tags-list").innerHTML = rep.join('\n');
    if (sTagOrder.length > 0) {
        idx = sTagOrder.indexOf(sPrevTag);
        if (idx < 0 && sViewPort > 0)
            idx = sTagOrder.indexOf(window.parent.sCurTag);
        pickTag((idx >=0)? idx: 0);
    }
    
    sBtnUndoTag.disabled = (sViewPort < 1) || !info["can_undo"];
    sBtnRedoTag.disabled = (sViewPort < 1) || !info["can_redo"];

    updateTagsState(true);
    
    for (idx = sInpTagNameList.length - 1; idx > 0; idx--) {
        sInpTagNameList.remove(idx);
    }
    
    all_tags = info["all-tags"];
    for (idx = 0; idx < all_tags.length; idx++) {
        tag_name = all_tags[idx];
        if (sTagOrder.indexOf(tag_name) < 0) {
            var option = document.createElement('option');
            option.innerHTML = tag_name;
            option.value = tag_name;
            sInpTagNameList.append(option)
        }
    }
    sInpTagNameList.selectedIndex = 0;
    
    if (info["marker"]) {
        parent.window.updateRecordMark(info["marker"][0], info["marker"][1])
    }
    
}

function updateTagsState(set_content) {
    if (set_content) {
        if (sCurTagIdx == null) {
            sInpTagName.value = "";
            sInpTagValue.value = "";
            sTagNameOK = false;
            sTagCntMode = true;
            sTagCntChanged = false;
        } else {
            tag_name = sTagOrder[sCurTagIdx];
            sInpTagName.value = tag_name;
            sInpTagValue.value = sTagsInfo["tags"][tag_name].trim();
            sTagNameOK = true;
            sTagCntMode = true;
            sTagCntChanged = false;
        }
    }
    checkInputs();
}

function checkInputs() {    
    if (sCurTagIdx == null) {
        tag_name = sInpTagName.value.trim();
        sTagNameOK = /^[A-Za-z0-9_\-]+$/i.test(tag_name) && tag_name[0] != '_'
            && sTagOrder.indexOf(tag_name) < 0;
        sTagCntChanged = !!(sInpTagValue.value.trim());
        
    } else {
        sTagNameOK = true;
        if (sTagCntMode) {
            tag_name = sTagOrder[sCurTagIdx];
            sTagCntChanged = (sInpTagValue.value.trim() != 
                sTagsInfo["tags"][tag_name].trim());            
        } else {
            sTagCntChanged = false;
        }
    }
    sInpTagName.className = (sTagNameOK == false)? "bad": "";
    sInpTagName.disabled  = (sViewPort < 1) || sCurTagIdx != null;
    sInpTagValue.disabled = (sViewPort < 1) || !sTagCntMode;
    sInpTagNameList.disabled = (sViewPort < 1) || (sCurTagIdx != null);
    
    sBtnNewTag.disabled     = (sViewPort < 1) || (sCurTagIdx == null);
    sBtnSaveTag.disabled    = (sViewPort < 1) || !(sTagCntMode && sTagNameOK && 
        (sCurTagIdx == null || sTagCntChanged));
    sBtnCancelTag.disabled  = (sViewPort < 1) || (!sTagCntChanged) || 
        (sCurTagIdx != null || sInpTagName.value.trim() != "");
    sBtnDeleteTag.disabled  = (sViewPort < 1) || (sCurTagIdx == null);
        
    if (sTagCntMode) {
        if (sTimeH == null) 
            sTimeH = setInterval(checkInputs, 200);
    } else {
        if (sTimeH != null) {
            clearInterval(sTimeH);
            sTimeH = null;
        }
    }
}

function dropCurTag() {
    if (sCurTagIdx != null) {
        el = document.getElementById("tag--" + sCurTagIdx);
        el.className = el.className.replace(" cur", "");
    }
    sCurTagIdx = null;
}

function tagEnvNew() {
    if (sViewPort < 1)
        return;
    if (sCurTagIdx != null) {
        dropCurTag();
        updateTagsState(true);
    }
}

function tagEnvSave() {
    if (sViewPort < 1)
        return;
    checkInputs();
    if (sTagCntMode && sTagNameOK) {
        tags_to_update = sTagsInfo["tags"];
        tags_to_update[sInpTagName.value] = sInpTagValue.value.trim();
        sPrevTag = sInpTagName.value;
        loadTags(tags_to_update);
        window.parent.checkTabNavigation(sPrevTag);
    }
}

function tagEnvCancel() {
    if (sViewPort < 1)
        return;
    updateTagsState(true);
}

function tagEnvDelete() {
    if (sViewPort < 1)
        return;
    checkInputs();
    if (sCurTagIdx != null) {
        tag_name = sTagOrder[sCurTagIdx];
        tags_to_update = sTagsInfo["tags"];
        delete tags_to_update[tag_name];
        sPrevTag = null;
        sCurTagIdx = null;
        loadTags(tags_to_update);
        window.parent.checkTabNavigation(tag_name);
    }
}

function tagEnvUndo() {
    if (sViewPort < 1)
        return;
    if (sTagsInfo["can_undo"]) {
        sPrevTag = (sCurTagIdx != null)? sTagOrder[sCurTagIdx] :  null;
        sCurTagIdx = null;
        loadTags("UNDO");
        window.parent.checkTabNavigation(null);
    }
}

function tagEnvRedo() {
    if (sViewPort < 1)
        return;
    if (sTagsInfo["can_redo"]) {
        sPrevTag = (sCurTagIdx != null)? sTagOrder[sCurTagIdx] :  null;
        sCurTagIdx = null;
        loadTags("REDO");
        window.parent.checkTabNavigation(null);
    }
}

function pickTag(idx) {
    if (idx != sCurTagIdx) {
        dropCurTag();
        sCurTagIdx = idx;
        el = document.getElementById("tag--" + sCurTagIdx);
        el.className = el.className + " cur";
        updateTagsState(true);
    }
}

function tagEnvTagSel() {
    if (sCurTagIdx == null) {
        sInpTagName.value = sInpTagNameList.value;
    }
}