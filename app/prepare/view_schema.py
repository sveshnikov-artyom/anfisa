from app.view.asp_set import AspectSetH
from app.view.aspect import AspectH
from app.view.attr import AttrH
from app.view.colgrp import ColGroupsH

#===============================================
def defineViewSchema():
    aspects = AspectSetH([
        AspectH("view_gen", "General", "view", field = "general"),
        AspectH("view_qsamples", "Quality", "view",
            col_groups = ColGroupsH(attr = "quality_samples")),
        AspectH("view_gnomAD", "gnomAD", "view",
                col_groups = ColGroupsH(attr = "gnomAD")),
        AspectH("view_db", "Databases", "view", field = "databases"),
        AspectH("view_pred", "Predictions", "view", field = "predictions"),
        AspectH("view_genetics", "Bioinformatics", "view",
            field = "bioinformatics"),
        AspectH("view_inheritance", "Inheritance", "view",
            field = "inheritance", ignored = True),
        AspectH("_main", "VEP Data", "data"),
        AspectH("transcripts", "VEP Transcripts", "data",
            col_groups = ColGroupsH([
                ("intergenic_consequences", "Intergenic"),
                ("motif_feature_consequences", "Motif"),
                ("regulatory_feature_consequences", "Regulatory"),
                ("transcript_consequences", "Transcript")])),
        AspectH("colocated_v", "Colocated Variants", "data",
            col_groups = ColGroupsH(attr = "colocated_variants")),
        AspectH("input", "VCF", "data", field = "input",
            mode = "string")])

    aspects["view_gen"].setAttributes([
        AttrH("genes", title = "Gene(s)", is_seq = True),
        AttrH("hg19"),
        AttrH("hg38"),
        AttrH("worst_annotation", title = "Worst Annotation"),
        AttrH("canonical_annotation", title = "Canonical Annotation"),
        AttrH("refseq_transcript_canonical",
            title = "RefSeq Transcript (Canonical)", is_seq = True),
        AttrH("refseq_transcript_worst",
            title = "RefSeq Transcript (Worst)", is_seq = True),
        AttrH("ensembl_transcripts_canonical",
            title = "Ensembl Transcripts (Canonical)", is_seq = True),
        AttrH("ensembl_transcripts_worst",
            title = "Ensembl Transcripts (Worst)", is_seq = True),
        AttrH("ref", title = "Ref"),
        AttrH("alt", title = "Alt"),
        AttrH("splice_region", title = "Splice Region", is_seq = True),
        AttrH("gene_splicer", title = "GeneSplicer", is_seq = True),
        AttrH("cpos_worst", title = "cPos (Worst)", is_seq = True),
        AttrH("cpos_canonical",
            title = "cPos (Canonical)", is_seq = True),
        AttrH("cpos_other", title = "cPos (Other)", is_seq = True),
        AttrH("ppos_worst", title = "pPos (Worst)", is_seq = True),
        AttrH("ppos_canonical",
            title = "pPos (Canonical)", is_seq = True),
        AttrH("ppos_other", title = "pPos (Other)", is_seq = True),
        AttrH("variant_exon_canonical",
            title = "Variant Exon (Canonical)", is_seq = True),
        AttrH("variant_exon_worst",
            title = "Variant Exon (Worst Annotation)", is_seq = True),
        AttrH("variant_intron_worst",
            title = "Variant Intron (Worst Annotation)", is_seq = True),
        AttrH("variant_intron_canonical",
            title = "Variant Intron (Canonical)", is_seq = True),
        AttrH(None),
        AttrH("proband_genotype", title = "Proband Genotype"),
        AttrH("maternal_genotype", title = "Maternal Genotype"),
        AttrH("paternal_genotype", title = "Paternal Genotype"),
        AttrH("igv", title = "IGV", kind="link")])

    aspects["view_qsamples"].setAttributes([
        AttrH("title", title = "Title"),
        AttrH("qd", title = "Quality by Depth"),
        AttrH("mq", title = "Mapping Quality"),
        AttrH("variant_call_quality", title = "Variant Call Quality"),
        AttrH("strand_odds_ratio", title = "Strand Odds Ratio"),
        AttrH("fs", title = "Fisher Strand Bias"),
        AttrH("allelic_depth", title = "Allelic Depth", is_seq = True),
        AttrH("read_depth", title = "Read Depth"),
        AttrH("ft", title = "FILTERs"),
        AttrH("genotype_quality", title = "Genotype Quality")])

    aspects["view_gnomAD"].setAttributes([
        AttrH("allele", title = "Allele"),
        AttrH("proband", title = "Proband"),
        AttrH("pli", title = "pLI", is_seq = True),
        AttrH("af", title="Overall AF"),
        AttrH("genome_af", title = "Genome AF"),
        AttrH("exome_af", title = "Exome AF"),
        AttrH("genome_an", title="Genome AN"),
        AttrH("exome_an", title="Exome AN"),
        AttrH("url", title = "URL", kind = "link", is_seq=True),
        AttrH("pop_max", title = "PopMax",)])

    aspects["view_db"].setAttributes([
        AttrH("hgmd", title = "HGMD"),
        AttrH("hgmd_hg38", title = "HGMD (HG38)"),
        AttrH("hgmd_tags", title = "HGMD TAGs", is_seq = True),
        AttrH("hgmd_phenotypes", title = "HGMD Phenotypes",
            is_seq = True),
        AttrH("hgmd_pmids", title = "HGMD PMIDs",
            is_seq = True, kind = "link"),
        AttrH("omim", title = "OMIM",
            is_seq = True, kind = "link"),
        AttrH("clinVar_variants", title = "ClinVar Variants",
            is_seq = True),
        AttrH("clinVar_significance", title = "ClinVar Significance",
            is_seq = True),
        AttrH("lmm_significance", title = "Clinical Significance by LMM"),
        AttrH("gene_dx_significance",
            title = "Clinical Significance by GeneDx"),
        AttrH("clinVar_phenotypes", title = "ClinVar Phenotypes",
            is_seq = True),
        AttrH("clinVar_submitters", title = "ClinVar Submitters",
            is_seq = True),
        AttrH("clinVar", title = "ClinVar",
            is_seq = True, kind = "link"),
        AttrH("gene_cards", title = "GeneCards",
            is_seq = True, kind = "link"),
        AttrH("pubmed_search", title="PubMed Search Results",
            is_seq = True, kind = "link"),
        AttrH("beacons", title="Observed at", is_seq = True),
        AttrH("beacon_url", title="Search Beacons",
            is_seq = True, kind = "link")])

    aspects["view_pred"].setAttributes([
        AttrH("lof_score", title = "LoF Score",
            is_seq = True),
        AttrH("lof_score_canonical", title = "LoF Score (Canonical)",
            is_seq = True),
        AttrH("max_ent_scan", title = "MaxEntScan",
            is_seq = True),
        AttrH("polyphen", title = "Polyphen",
            is_seq = True),
        AttrH("polyphen2_hvar", title = "Polyphen 2 HVAR",
            is_seq = True),
        AttrH("polyphen2_hdiv", title = "Polyphen 2 HDIV",
            is_seq = True),
        AttrH("sift", title = "SIFT",
            is_seq = True),
        AttrH("revel", title = "REVEL",
            is_seq = True),
        AttrH("mutation_taster", title = "Mutation Taster",
            is_seq = True),
        AttrH("fathmm", title = "FATHMM", is_seq = True),
        AttrH("cadd_phred", title = "CADD (Phred)",
            is_seq = True),
        AttrH("cadd_raw", title = "CADD (Raw)",
            is_seq = True),
        AttrH("mutation_assessor", title = "Mutation Assessor",
            is_seq = True),
        AttrH("sift_score", title = "SIFT score",
            is_seq = True),
        AttrH("polyphen2_hvar_score", title = "Polyphen 2 HVAR score",
            is_seq = True),
        AttrH("polyphen2_hdiv_score", title = "Polyphen 2 HDIV score",
            is_seq = True)])

    aspects["view_genetics"].setAttributes([
        AttrH("zygosity", title = "Zygosity"),
        AttrH("inherited_from", title = "Inherited from"),
        AttrH("dist_from_exon_worst",
            title="Distance From Intron/Exon Boundary (Worst)",
            is_seq = True),
        AttrH("dist_from_exon_canonical",
            title="Distance From Intron/Exon Boundary (Canonical)",
            is_seq = True),
        AttrH("conservation", title = "Conservation", is_seq = True),
        AttrH("species_with_variant",
            title = "Species with variant"),
        AttrH("species_with_others",
            title = "Species with other variants"),
        AttrH("max_ent_scan", title = "MaxEntScan", is_seq = True),
        AttrH("nn_splice", title = "NNSplice"),
        AttrH("human_splicing_finder", title = "Human Splicing Finder"),
        AttrH("other_genes",
            title="Gene symbols from other transcripts",
            is_seq = True),
        AttrH("called_by", title = "Called by", is_seq = True),
        AttrH("caller_data", title = "CALLER DATA")])

    aspects["_main"].setAttributes([
        AttrH("label"),
        AttrH("color_code"),
        AttrH("id"),
        AttrH("assembly_name", title = "Assembly"),
        AttrH("seq_region_name"),
        AttrH("start"),
        AttrH("end"),
        AttrH("strand"),
        AttrH("allele_string"),
        AttrH("variant_class"),
        AttrH("most_severe_consequence"),
        AttrH("ws_compound_heterosygotes"),
        AttrH("ClinVar"),
        AttrH("clinvar_variants", is_seq = True),
        AttrH("clinvar_phenotypes", is_seq = True),
        AttrH("clinvar_significance", is_seq = True),
        AttrH("HGMD"),
        AttrH("HGMD_HG38"),
        AttrH("HGMD_PIMIDs", kind = "hidden", is_seq = True),
        AttrH("HGMD_phenotypes", kind = "hidden", is_seq = True),
        AttrH("EXPECTED"),
        AttrH("gnomad_db_genomes_af", kind = "hidden"),
        AttrH("gnomad_db_exomes_af", kind = "hidden"),
        AttrH("SEQaBOO")])

    aspects["transcripts"].setAttributes([
        AttrH("amino_acids"),
        AttrH("bam_edit"),
        AttrH("biotype"),
        AttrH("cadd_phred"),
        AttrH("cadd_raw"),
        AttrH("canonical"),
        AttrH("ccds"),
        AttrH("cdna_end"),
        AttrH("cdna_start"),
        AttrH("cds_end"),
        AttrH("cds_start"),
        AttrH("clinvar_clnsig"),
        AttrH("clinvar_rs"),
        AttrH("codons"),
        AttrH("consequence_terms", is_seq = True),
        AttrH("conservation"),
        AttrH("distance"),
        AttrH("domains", kind = "json"),
        AttrH("exacpli"),
        AttrH("exon"),
        AttrH("fathmm_pred"),
        AttrH("fathmm_score"),
        AttrH("flags", is_seq = True),
        AttrH("gene_id"),
        AttrH("gene_pheno"),
        AttrH("genesplicer"),
        AttrH("gene_symbol"),
        AttrH("gene_symbol_source"),
        AttrH("given_ref"),
        AttrH("gnomad_exomes_ac"),
        AttrH("gnomad_exomes_af"),
        AttrH("gnomad_exomes_an"),
        AttrH("gnomad_exomes_asj_af"),
        AttrH("gnomad_genomes_ac"),
        AttrH("gnomad_genomes_af"),
        AttrH("gnomad_genomes_an"),
        AttrH("gnomad_genomes_asj_af"),
        AttrH("hgnc_id"),
        AttrH("hgvs_offset"),
        AttrH("hgvsc"),
        AttrH("hgvsp"),
        AttrH("high_inf_pos"),
        AttrH("impact"),
        AttrH("intron"),
        AttrH("loftool"),
        AttrH("maxentscan_alt"),
        AttrH("maxentscan_diff"),
        AttrH("maxentscan_ref"),
        AttrH("motif_feature_id"),
        AttrH("motif_name"),
        AttrH("motif_pos"),
        AttrH("motif_score_change"),
        AttrH("mutationassessor_pred"),
        AttrH("mutationassessor_score"),
        AttrH("mutationtaster_pred"),
        AttrH("mutationtaster_score"),
        AttrH("polyphen2_hdiv_pred"),
        AttrH("polyphen2_hdiv_score"),
        AttrH("polyphen2_hvar_pred"),
        AttrH("polyphen2_hvar_score"),
        AttrH("polyphen_prediction"),
        AttrH("polyphen_score"),
        AttrH("protein_end"),
        AttrH("protein_id"),
        AttrH("protein_start"),
        AttrH("regulatory_feature_id"),
        AttrH("revel_score"),
        AttrH("sift_pred"),
        AttrH("sift_prediction"),
        AttrH("sift_score"),
        AttrH("strand"),
        AttrH("source"),
        AttrH("spliceregion", is_seq = True),
        AttrH("swissprot", is_seq = True),
        AttrH("transcript_id"),
        AttrH("trembl", is_seq = True),
        AttrH("uniparc", is_seq = True),
        AttrH("used_ref"),
        AttrH("variant_allele")])

    aspects["colocated_v"].setAttributes([
        AttrH("id"),
        AttrH("start"),
        AttrH("end"),
        AttrH("allele_string"),
        AttrH("strand"),
        AttrH("pubmed", is_seq = True),
        AttrH("somatic"),
        AttrH("gnomAD"),
        AttrH("frequencies", kind = "json"),
        AttrH("phenotype_or_disease"),
        AttrH("seq_region_name"),
        AttrH("clin_sig", is_seq = True),
        AttrH("minor")])

    return aspects
