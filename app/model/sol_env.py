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

from datetime import datetime

from app.config.a_config import AnfisaConfig

#===============================================
class SolutionEnv:
    def __init__(self, mongo_connector, name):
        self.mName = name
        self.mMongoAgent = mongo_connector.getPlainAgent(name)
        self.mBrokers = []
        self.mHandlers = {sol_kind: _SolKindMongoHandler(
            sol_kind, data_name, self.mMongoAgent)
            for sol_kind, data_name in
            (("filter", "seq"), ("dtree", "code"))}
        self.mTagHander = _SolTagsMongoHandler(self.mMongoAgent)

    def getName(self):
        return self.mName

    def getAgentKind(self):
        return "SolutionEnv"

    def attachBroker(self, broker_h):
        assert broker_h not in self.mBrokers
        self.mBrokers.append(broker_h)
        for sol_kind in self.mHandlers.keys():
            broker_h.refreshSolEntries(sol_kind)

    def detachBroker(self, broker_h):
        assert broker_h in self.mBrokers
        self.mBrokers.remove(broker_h)

    def iterEntries(self, key):
        return self.mHandlers[key].iterEntries()

    def modifyEntry(self, ds_name, key, option, name, value):
        if self.mHandlers[key].modifyData(option, name, value, ds_name):
            for broker_h in self.mBrokers:
                broker_h.refreshSolEntries(key)
            return True
        return False

    def getTagsData(self, rec_key):
        return self.mTagHander.getData(rec_key)

    def setTagsData(self, rec_key, pairs, prev_data = False):
        self.mTagHander.setData(rec_key, pairs, prev_data)

#===============================================
class _SolKindMongoHandler:
    def __init__(self, key, value_name, mongo_agent):
        self.mSolKind = key
        self.mPrefix = key + '-'
        self.mPrefLen = len(self.mPrefix)
        self.mValName = value_name
        self.mMongoAgent = mongo_agent
        self.mData = dict()
        for it in self.mMongoAgent.find({"_tp": self.mSolKind}):
            it_id = it["_id"]
            if it_id.startswith(self.mPrefix):
                name = it_id[self.mPrefLen:]
                self.mData[name] = [it[self.mValName],
                    AnfisaConfig.normalizeTime(it.get("time")), it["from"]]

    def getSolKind(self):
        return self.mSolKind

    def iterEntries(self):
        ret = []
        for name in sorted(self.mData.keys()):
            value, upd_time, upd_from = self.mData[name]
            ret.append((name, value, upd_time, upd_from))
        return iter(ret)

    def modifyData(self, option, name, value, upd_from):
        if option == "UPDATE":
            time_label = datetime.now().isoformat()
            self.mMongoAgent.update({"_id": self.mPrefix + name},
                {"$set": {self.mValName: value, "_tp": self.mSolKind,
                    "time": time_label, "from": upd_from}},
                upsert = True)
            self.mData[name] = [value,
                AnfisaConfig.normalizeTime(time_label),
                upd_from]
            return True
        if option == "DELETE" and name in self.mData:
            self.mMongoAgent.remove(
                {"_tp": self.mSolKind, "_id": self.mPrefix + name})
            del self.mData[name]
            return True
        return False

#===============================================
class _SolTagsMongoHandler:
    def __init__(self, mongo_agent):
        self.mMongoAgent = mongo_agent

    def getData(self, rec_key):
        return self.mMongoAgent.find_one({"_id": "rec-" + rec_key})

    def setData(self, rec_key, pairs, prev_data = False):
        data = pairs.copy()
        data["_id"] = "rec-" + rec_key
        update_instr = dict()
        if len(pairs) > 0:
            update_instr["$set"] = {key: value
                for key, value in pairs.items()}
        if prev_data is False:
            prev_data = self.getTagsData(rec_key)
        unset_keys = set(prev_data.keys() if prev_data is not None else [])
        unset_keys -= set(pairs.keys())
        if "_id" in unset_keys:
            unset_keys.remove("_id")
        if len(unset_keys) > 0:
            update_instr["$unset"] = {key: "" for key in unset_keys}
        if len(update_instr) > 0:
            self.mMongoAgent.update(
                {"_id": "rec-" + rec_key}, update_instr, upsert = True)
