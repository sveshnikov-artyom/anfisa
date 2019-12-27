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

import os

#===============================================
class AnfisaConfig:
    sTextMessages = {
        "aspect.tags.title": "Tags&nbsp;&amp;<br/>Filters"}

    sConfigOptions = {
        "aspect.tags.name": "tags_data",
        "check.tags":       [
            "Previously categorized",
            "Previously Triaged",
            "Not categorized",
            "Benign/Likely benign",
            "False positives"
        ],
        "zygosity.cases": {
            "homo_recess": "Homozygous Recessive",
            "x_linked": "X-linked",
            "dominant": "Autosomal Dominant",
            "compens": "Compensational"
        },
        "rand.min.size":    100,
        "rand.sample.size": 100,

        "tm.coeff": .2,

        "max.ws.size":  9000,
        "report.lines": 100,
        "max.export.size": 300,

        "xl.view.count.full": 300,
        "xl.view.count.samples": 25,
        "xl.view.min.samples": 50,

        "max.tree.versions": 30,

        "filter.std.mark": u"\u23da",

        "comp-hets.setup": {
            "zygosity.unit": "Inheritance_Mode",
            "vgroup": "Inheritance",
            "Genes": "Symbol",
            "op-variables.xl": [
                ["Compound_Het", "Symbol",
                    "Calculated Compound Hetreozygous"],
                ["Compound_Het2", "Symbol",
                    "Calculated Compound Hetreozygous"]],
            "op-variables.ws": [
                ["Compound_Het_transcript", "Transcript_id",
                    "Compound Heterozygous, shared transcript"],
                ["Compound_Het_gene", "Transctript_gene_id",
                    "Compound Heterozygous, shared gene"],
                ["Compound_Het_rough", "Symbol",
                    "Compound Heterozygous, non-intersecting transcripts"]],
        },

        "transcript.path.base": "/data/transcript_consequences",
        "transcript.view.setup": ("transcripts", "transcript_consequences"),

        "job.pool.size":    3,
        "job.pool.threads": 1}

    sTextDecor = {
        "VEP Data": "VEP<br/>Data",
        "VEP Transcripts": "VEP<br/>Transcripts",
        "Colocated Variants": "Colocated<br/>Variants"}

    @classmethod
    def textMessage(cls, key):
        return cls.sTextMessages[key]

    @classmethod
    def configOption(cls, key):
        return cls.sConfigOptions[key]

    @classmethod
    def decorText(cls, text):
        return cls.sTextDecor.get(text, text)

    @classmethod
    def normalizeColorCode(cls, color_code):
        if color_code in {"red", "red-cross",
                "yellow", "yellow-cross", "green"}:
            return color_code
        return "grey"

    @classmethod
    def normalizeTime(cls, time_label):
        if time_label is None:
            return '2019-03-01T00:00:00'
        return time_label

    @classmethod
    def getAnfisaVersion(cls):
        with open(os.path.dirname(os.path.abspath(__file__))
                + "/../VERSION", "r", encoding = "utf-8") as inp:
            return inp.read().strip()


#===============================================
