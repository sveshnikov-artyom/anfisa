#  Copyright (c) 2019. Partners HealthCare and other members of
#  Forome Association
#
#  Developed by Sergey Trifonov based on contributions by Joel Krier,
#  Michael Bouzinier, Shamil Sunyaev and other members of Division of
#  Genetics, Brigham and Women's Hospital
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#        http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#

import logging
from threading import Lock

from utils.sync_obj import SyncronizedObject
from app.config.a_config import AnfisaConfig
from .sol_pack import SolutionPack
#===============================================
class SolutionBroker(SyncronizedObject):
    def __init__(self, data_schema, modes):
        SyncronizedObject.__init__(self)
        self.mDataSchema = data_schema
        self.mSolPack = SolutionPack.select(data_schema)
        self.mLock  = Lock()
        self.mModes = set()
        self.mModes.add(self.mDataSchema)
        self.addModes(modes)
        self.mStdFilterDict = None
        self.mStdFilterList = None
        self.mFilterCache = None
        self.mSolEnv = None
        self.mSolKinds = None

    def getSolEnv(self):
        return self.mSolEnv

    def getDataSchema(self):
        return self.mDataSchema

    #===============================================
    def setSolEnv(self, sol_space):
        assert self.mSolEnv is None
        with self:
            self.mSolEnv = sol_space
            self.mSolKinds = {kind: _SolutionKindHandler(self, kind)
                for kind in ("filter", "dtree")}
            self.mSolEnv.attachBroker(self)

    def deactivate(self):
        if self.mSolEnv is not None:
            self.mSolEnv.detachBroker(self)

    #===============================================
    def addModes(self, modes):
        if modes:
            self.mModes |= set(modes)

    def testRequirements(self, modes):
        if not modes:
            return True
        return len(modes & self.mModes) == len(modes)

    def iterStdItems(self, item_kind):
        return self.mSolPack.iterItems(item_kind, self.testRequirements)

    def getStdItem(self, item_kind, item_name):
        for it in self.mSolPack.iterItems(item_kind, self.testRequirements):
            if it.getName() == item_name:
                return it
        return None

    #===============================================
    def getUnitPanelNames(self, unit_name):
        ret = []
        for it in self.iterStdItems("panel"):
            if it.getName() == unit_name:
                ret.append(it.getData()[0])
        return ret

    def getUnitPanel(self, unit_name, panel_name, assert_mode = True):
        for it in self.iterStdItems("panel"):
            if it.getName() == unit_name:
                if it.getData()[0] == panel_name:
                    return it.getData()[1]
        if assert_mode:
            assert False, "%s: Panel %s not found" % (unit_name, panel_name)
        else:
            logging.warning("%s: Panel %s not found" % (unit_name, panel_name))
        return None

    #===============================================
    def refreshSolEntries(self, kind):
        with self:
            if kind in self.mSolKinds:
                self.mSolKinds[kind].refreshSolEntries()
            elif kind == "tags" and self.getDSKind() == "ws":
                self.getTagsMan().refreshTags()

    def iterSolEntries(self, kind):
        sol_kind_h = self.mSolKinds[kind]
        for info in sol_kind_h.getList():
            yield sol_kind_h.pickByName(info["name"])

    def noSolEntries(self, kind):
        return self.mSolKinds[kind].isEmpty()

    def pickSolEntry(self, kind, name):
        return self.mSolKinds[kind].pickByName(name)

    def updateSolEntry(self, kind, sol_entry):
        return self.mSolKinds[kind].updateSolEntry(sol_entry)

    def modifySolEntry(self, kind, instr, entry_data):
        with self:
            return self.mSolKinds[kind].modifySolEntry(instr, entry_data)

    def getSolEntryList(self, kind):
        return self.mSolKinds[kind].getList()

    #===============================================
    def reportSolutions(self):
        panel_info = dict()
        for it in self.iterStdItems("panel"):
            unit_name = it.getName()
            if unit_name in panel_info:
                panel_info[unit_name].append(it.getData()[0])
            else:
                panel_info[unit_name] = [it.getData()[0]]
        return {
            "codes": [it.getName()
                for it in self.iterStdItems("tree_code")],
            "panels": panel_info}

#===============================================
class _SolutionKindHandler:
    sStdFMark = AnfisaConfig.configOption("filter.std.mark")

    def __init__(self, broker, sol_kind):
        self.mBroker = broker
        self.mSolKind = sol_kind
        self.mNames = []
        self.mEntryDict = dict()
        for it in self.mBroker.iterStdItems(self.mSolKind):
            std_name = self.sStdFMark + it.getName()
            self.mNames.append(std_name)
            self.mEntryDict[std_name] = self.mBroker.makeSolEntry(
                self.mSolKind, it.getData(), std_name)
        self.mStdCount = len(self.mNames)
        self.mHashDict = {entry_obj.getHashCode(): entry_obj
            for entry_obj in self.mEntryDict.values()}

    def isEmpty(self):
        return len(self.mNames) == 0

    def refreshSolEntries(self):
        _names = []
        updated = False
        with self.mBroker:
            for info in self.mBroker.getSolEnv().iterEntries(self.mSolKind):
                name, entry_data, upd_time, upd_from = info
                _names.append(name)
                entry_obj = self.mEntryDict.get(name)
                if (entry_obj is not None
                        and [upd_time, upd_from] != entry_obj.getUpdateInfo()):
                    del self.mHashDict[entry_obj.getHashCode()]
                    entry_obj = None
                if entry_obj is None:
                    entry_obj = self.mBroker.makeSolEntry(self.mSolKind,
                        entry_data, name, upd_time, upd_from)
                    self.mEntryDict[name] = entry_obj
                    self.mHashDict[entry_obj.getHashCode()] = entry_obj
                    updated = True
            for name in (set(self.mNames[self.mStdCount:]) - set(_names)):
                entry_obj = self.mEntryDict[name]
                del self.mHashDict[entry_obj.getHashCode()]
                del self.mEntryDict[name]
                updated = True
            if updated:
                self.mNames = self.mNames[:self.mStdCount] + _names
        return updated

    def getList(self):
        ret_handle = []
        with self.mBroker:
            for idx, name in enumerate(self.mNames):
                entry_obj = self.mEntryDict[name]
                upd_time, upd_from = entry_obj.getUpdateInfo()
                ret_handle.append({
                    "name": name,
                    "standard": idx < self.mStdCount,
                    "upd-time": upd_time,
                    "upd-from": upd_from,
                    "eval-status": entry_obj.getEvalStatus(),
                    "sol-version": self.mBroker.getSolEnv().getIntVersion(
                        self.mSolKind)
                })
        return ret_handle

    def modifySolEntry(self, instr, entry_data):
        option, name = instr
        assert (name and not name.startswith(self.sStdFMark)
            and name[0].isalpha() and ' ' not in name)
        return self.mBroker.getSolEnv().modifyEntry(
            self.mBroker.getName(), self.mSolKind, option, name, entry_data)

    def updateSolEntry(self, sol_obj):
        with self.mBroker:
            upd_sol_entry = self.mHashDict.get(sol_obj.getHashCode())
            if upd_sol_entry is not None:
                return upd_sol_entry
            return sol_obj

    def pickByHash(self, hash_code):
        with self.mBroker:
            return self.mHashDict.get(hash_code)

    def pickByName(self, name):
        with self.mBroker:
            return self.mEntryDict[name]
