import { z } from "zod";

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.

export const SkillSchema = z.object({
	name: z.string(),
	value: z.number(),
});
export type Skill = z.infer<typeof SkillSchema>;

export const NilaiSchema = z.object({
	category: z.number(),
	code: z.string(),
	matakuliah: z.string(),
	score: z.number(),
});
export type Nilai = z.infer<typeof NilaiSchema>;

export const LaporanMagangSchema = z.object({
	hardSkills: z.array(SkillSchema),
	softSkills: z.array(SkillSchema),
});
export type LaporanMagang = z.infer<typeof LaporanMagangSchema>;

export const taskSchema = z.object({
	id: z.string(),
	createdAt: z.string(),
	name: z.string(),
	address: z.string(),
	jenisMagang: z.string(),
	status: z.number(),
	mataKuliah: z.string(),
	codeKuliah: z.string(),
	konsultasiPA: z.string(),
	rancangKRS: z.boolean(),
	learningAgreement: z.boolean(),
	validasiDekan: z.boolean(),
	validasiKaprodi: z.boolean(),
	laporanMagang: LaporanMagangSchema,
	fileLaporan: z.array(z.string()),
	tanggalSidang: z.string(),
	nilai: z.array(NilaiSchema),
	index: z.number(),
});

export type Task = z.infer<typeof taskSchema>;
