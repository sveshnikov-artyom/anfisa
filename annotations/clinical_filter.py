import os
import sys

from annotations import filters, case_utils, data_path, liftover
from annotations.gnomad import GnomAD
from annotations.hgmd import HGMD
from annotations.record import Variant


class Filter:
    DATA_PATH = data_path()
    def __init__(self, data_dir = None):
        if (not data_dir):
            data_dir = Filter.DATA_PATH
        self.hgmd_filter = filters.Filter_HGMD(data_dir)
        self.clinvar_filter = filters.Filter_ClinVar(data_dir)
        self.gnomad_filter1 = filters.Filter_gnomAD_AF(0.01)
        self.gnomad_filter5 = filters.Filter_gnomAD_AF(0.05)
        self.quality_filter = filters.Filter_Quality()

    def accept(self, vcf_record, info = dict()):
        ok = False
        if (self.hgmd_filter.accept(vcf_record)):
            ok = True
            info['HGMD'] = True
        else:
            info['HGMD'] = False

        if (self.clinvar_filter.accept(vcf_record)):
            ok = True
            info['ClinVar'] = True
        else:
            info['ClinVar'] = False

        # if (vcf_record.start() == 16378047):
        #     pass
        if (ok):
            ok = self.gnomad_filter5.accept(vcf_record)
            info['gnomAD(5%)'] = ok
        else:
            ok = self.gnomad_filter1.accept(vcf_record)
            info['gnomAD(1%)'] = ok

        ok = ok and self.quality_filter.accept(vcf_record)

        return ok


def process_file(f, out = None, vcf_header = None, samples = None, expected = None, case = None, limit = None):
    n = 0
    n_accepted = 0
    n1 = 0
    n2 = 0
    cube = dict()
    KEYs = ['HGMD only', 'ClinVar only', 'HGMD & ClinVar', 'gnomAD: AF<1%', 'Singleton']

    clinical_filter = Filter()
    output1 = out.format("all")
    output2 = out.format("false")
    output3 = out.format("candidates")
    gnomAD = GnomAD()
    hg19_to_38_converter = liftover.Converter()

    csq_set = set()

    with open(f) as input, open(output1, "w") as out1, open(output2, "w") as out2, open(output3, "w") as out3, HGMD() as hgmd:
        while(True):
            line = input.readline()
            if (not line):
                break
            v = Variant(line, vcf_header=vcf_header, samples=samples, case = case, gnomAD_connection=gnomAD, HGMD_connector=hgmd)
            n += 1
            if (n%100 == 0):
                print n
            info = {}
            csq_set.add(v.get_msq())
            v.hg38_start = hg19_to_38_converter.hg38(v.chr_num(), v.start())
            v.hg38_end = hg19_to_38_converter.hg38(v.chr_num(), v.end())
            if (not clinical_filter.accept(v, info)):
                ## continue
                pass
            else:
                #n_accepted += 1
                v.data["SEQaBOO"] = True
            if (expected.has_key((v.chr_num(), v.start()))):
                v.data["EXPECTED"] = True


            if (v.data.get("EXPECTED") == v.data.get("SEQaBOO")):
                #continue
                pass
            n_accepted += 1
            if (v.get_gnomad_af()):
                n1 += 1
                if (info['HGMD'] and info['ClinVar']):
                    key = 'HGMD & ClinVar'
                elif (info['HGMD']):
                    key = 'HGMD only'
                elif (info['ClinVar']):
                    key = 'ClinVar only'
                elif (info['gnomAD(1%)']):
                    key = 'gnomAD: AF<1%'
                else:
                    key = "UNKNOWN"
            else:
                rows = gnomAD.get_data(v.chr_num(), v.start())
                if (rows):
                    pass
                key = 'Singleton'
                if (info['HGMD']):
                    key = "{} & HGMD".format(key)
                if (info['ClinVar']):
                    key = "{} & ClinVar".format(key)

            if (info['ClinVar']):
                v.data["ClinVar"] = ""

            if (not key in KEYs):
                KEYs.append(key)

            msq = v.get_msq()

            f = cube.get((msq, key),0)
            cube[(msq, key)] = f + 1

            out1.write(v.get_view_json() + '\n')
            if (v.data.get("EXPECTED") <> v.data.get("SEQaBOO")):
                out2.write(v.get_view_json() + '\n')
            if (v.data.get("SEQaBOO")):
                out3.write(v.get_view_json() + '\n')

            if (limit and n >= limit):
                break
            # if (msq in ["frameshift_variant", "missense_variant"] and key == 'Singleton'):
            #     print "{}: {}, {}:{}".format(v.get('id'), msq, v.get("seq_region_name"), v.get('start'))

    print "{}: {}/{}/{}".format(n, n_accepted, n1, n2)
    print csq_set

    format = "{:40} "
    for key in KEYs:
        format = format + " {:>16}"
    print format.format("", *KEYs)
    for csq in Variant.consequences:
        values = [cube.get((csq, k)) for k in KEYs]
        print format.format(csq, *values)



if __name__ == '__main__':
    header_file = "header.vcf"
    case = "bgm9001"
    dir = os.getcwd()
    expected_file = "xbrowse_{}_SEQaBOO_filters.txt".format(case)
    fam_file = "{}.fam".format(case)
    filtered_by_bed_vep_output = "{}_wgs_xbrowse.vep.filtered.vep.json".format(case)
    #filtered_by_bed_vep_output = "chr17.vep.json"
    arg1 = sys.argv[1] if len(sys.argv) > 1 else None
    limit = None
    if (arg1):
        if (arg1.isdigit()):
            limit = int(arg1)
        else:
            filtered_by_bed_vep_output = arg1
    print "limit = {}".format(limit)
    print "file: {}".format(filtered_by_bed_vep_output)

    ##process_file("/Users/misha/projects/bgm/cases/bgm9001/tmp/f1.json")
    with open (header_file) as vcf:
        header = vcf.read()

    expected_set = {}
    with open (os.path.join(dir,expected_file)) as f1:
        lines = f1.readlines()
        for line in lines:
            data = line.split('\t')
            ch = data[2].strip()
            c = ch[3:]
            p = int (data[3].strip())
            expected_set[(c,p)] = 1


    samples = case_utils.parse_fam_file(fam_file)

    if (True):
        output = "{}/{}_wgs_{}.json".format(dir, case, "{}")

    process_file(filtered_by_bed_vep_output, out=output,
                     vcf_header=header, samples=samples, expected=expected_set, case="{}_wgs".format(case), limit =limit)
