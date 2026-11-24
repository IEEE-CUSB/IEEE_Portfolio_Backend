// src/recruitment/applications-export.builder.ts
import * as ExcelJS from 'exceljs';
import { Vacancy } from './entities/vacancy.entity';
import { Application } from './entities/application.entity';
import { VacancyQuestion } from './entities/vacancy-question.entity';

/** Prevent CSV/Excel formula injection from user-supplied text. */
function safeCell(value: unknown): string | number {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value;
  const text = String(value);
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

/** Turns any stored answer shape into readable text. */
function formatAnswer(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (Array.isArray(value)) {
    return value.map(formatAnswer).filter(Boolean).join(', ');
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (typeof obj.url === 'string') return obj.url; // FILE answers
    return JSON.stringify(obj);
  }
  return String(value);
}

const fmtDate = (d: Date) => d.toISOString().replace('T', ' ').slice(0, 19);

export async function buildApplicationsWorkbook(
  vacancy: Vacancy,
  allApplications: Application[],
  cvUrl: (app: Application) => string,
): Promise<{ fileBuffer: Buffer; fileName: string }> {
  // One row per applicant (list is newest-first, so we keep the latest)
  const seenUsers = new Set<string>();
  const applications = allApplications.filter((app) => {
    if (seenUsers.has(app.user_id)) return false;
    seenUsers.add(app.user_id);
    return true;
  });

  const questions: VacancyQuestion[] = [...(vacancy.questions ?? [])].sort(
    (a, b) => a.order - b.order,
  );

  // Unique, meaningful headers for question columns
  const usedHeaders = new Set<string>();
  const questionColumns = questions.map((q, i) => {
    let header = q.question_text.trim() || `Question ${i + 1}`;
    if (usedHeaders.has(header)) header = `${header} (#${i + 1})`;
    usedHeaders.add(header);
    return { question: q, header, key: `q_${q.id}` };
  });

  // Answers whose key matches no current question (e.g. since-edited questions)
  const questionKeys = new Set(
    questions.flatMap((q) => [q.id, q.question_text]),
  );
  const hasOrphans = applications.some((a) =>
    Object.keys(a.extra_data ?? {}).some((k) => !questionKeys.has(k)),
  );

  const workbook = new ExcelJS.Workbook();
  workbook.created = new Date();
  const sheet = workbook.addWorksheet('Applications');

  sheet.columns = [
    { header: 'Application ID', key: 'id', width: 38 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Applied At', key: 'created_at', width: 20 },
    { header: 'Last Updated', key: 'updated_at', width: 20 },
    { header: 'Name', key: 'name', width: 28 },
    { header: 'Username', key: 'username', width: 22 },
    { header: 'Email', key: 'email', width: 32 },
    { header: 'Phone', key: 'phone', width: 18 },
    { header: 'University', key: 'university', width: 26 },
    { header: 'Faculty', key: 'faculty', width: 26 },
    { header: 'Major', key: 'major', width: 24 },
    { header: 'Academic Year', key: 'academic_year', width: 14 },
    { header: 'Bio', key: 'bio', width: 40 },
    { header: 'CV Link', key: 'cv', width: 16 },
    ...questionColumns.map((c) => ({
      header: c.header,
      key: c.key,
      width: 36,
    })),
    ...(hasOrphans
      ? [{ header: 'Other Answers', key: 'orphans', width: 40 }]
      : []),
  ];

  for (const app of applications) {
    const extra: Record<string, unknown> = app.extra_data ?? {};
    const u = app.user;

    const row: Record<string, unknown> = {
      id: app.id,
      status: app.status,
      created_at: fmtDate(app.created_at),
      updated_at: fmtDate(app.updated_at),
      name: safeCell(u?.name),
      username: safeCell(u?.username),
      email: safeCell(u?.email),
      phone: safeCell(u?.phone),
      university: safeCell(u?.university),
      faculty: safeCell(u?.faculty),
      major: safeCell(u?.major),
      academic_year: u?.academic_year ?? '',
      bio: safeCell(u?.bio),
      cv: u?.cv_file_key ? { text: 'View CV', hyperlink: cvUrl(app) } : '',
    };

    for (const c of questionColumns) {
      const raw = extra[c.question.id] ?? extra[c.question.question_text];
      row[c.key] = safeCell(formatAnswer(raw));
    }

    if (hasOrphans) {
      row.orphans = safeCell(
        Object.entries(extra)
          .filter(([k]) => !questionKeys.has(k))
          .map(([k, v]) => `${k}: ${formatAnswer(v)}`)
          .join(' | '),
      );
    }

    sheet.addRow(row);
  }

  // Formatting
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF00529B' },
  };
  headerRow.alignment = { vertical: 'middle', wrapText: true };
  headerRow.height = 24;
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columnCount },
  };
  sheet.eachRow((r, i) => {
    if (i > 1) r.alignment = { vertical: 'top', wrapText: true };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const safeTitle =
    vacancy.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') ||
    'vacancy';

  return {
    fileBuffer: Buffer.from(buffer as ArrayBuffer),
    fileName: `applications-${safeTitle}-${new Date().toISOString().split('T')[0]}.xlsx`,
  };
}
