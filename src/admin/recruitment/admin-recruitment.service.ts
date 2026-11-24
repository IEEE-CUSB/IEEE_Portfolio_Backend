import {
  InternalServerErrorException,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as path from 'path';
import { Application } from '../../recruitment/entities/application.entity';
import { VacanciesRepository } from '../../recruitment/vacancies.repository';
import { ApplicationsRepository } from '../../recruitment/applications.repository';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { VacanciesQueryDto } from './dto/vacancies-query.dto';
import { ApplicationsQueryDto } from './dto/applications-query.dto';
import { ERROR_MESSAGES } from 'src/constants/swagger-messages';
import { StorageService } from '../../storage/storage.service';
import { paginatedResponse } from 'src/common/utils/pagination.util';
import * as ExcelJS from 'exceljs';
import { MediaService } from '../../media/media.service';
import { resolveMediaFolder } from '../../media/media.utils';
import { MailService } from '../../mail/mail.service';
import { RecruitmentService } from '../../recruitment/recruitment.service';
import { VacancyQuestion } from 'src/recruitment/entities/vacancy-question.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

const VACANCIES_MEDIA_FOLDER = resolveMediaFolder(
  'VACANCIES_IMAGES_FILE_NAME',
  'vacancies',
);

/** `cv_url` is derived per-request, not a mapped column on the entity. */
type ApplicationWithCvUrl = Application & { cv_url?: string };

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
  if (Array.isArray(value))
    return value.map(formatAnswer).filter(Boolean).join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    // FILE answers: { url, public_id }
    if (typeof obj.url === 'string') return obj.url;
    return JSON.stringify(obj);
  }
  return String(value);
}

@Injectable()
export class AdminRecruitmentService {
  private readonly logger = new Logger(AdminRecruitmentService.name); // added

  constructor(
    private readonly mailService: MailService,
    private readonly recruitmentService: RecruitmentService,
    private readonly vacanciesRepository: VacanciesRepository,
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly storageService: StorageService,
    private readonly mediaService: MediaService,
    @InjectRepository(VacancyQuestion)
    private readonly questionRepo: Repository<VacancyQuestion>,
  ) {}

  createApplicationShare(vacancyId: string) {
    return this.recruitmentService.createApplicationShare(vacancyId);
  }

  async createVacancy(dto: CreateVacancyDto) {
    const vacancy = this.vacanciesRepository.create(dto);
    return this.vacanciesRepository.save(vacancy);
  }

  async updateVacancy(id: string, dto: UpdateVacancyDto) {
    const { questions, ...vacancyFields } = dto;

    const vacancy = await this.vacanciesRepository.preload({
      id,
      ...vacancyFields,
    });
    if (!vacancy) {
      throw new NotFoundException(ERROR_MESSAGES.VACANCY_NOT_FOUND);
    }

    await this.vacanciesRepository.save(vacancy);

    // undefined = "client didn't touch questions"; [] = "remove them all"
    if (questions !== undefined && questions !== null) {
      const existing = await this.questionRepo.find({
        where: { vacancy_id: id },
      });
      const keepIds = new Set(questions.filter((q) => q.id).map((q) => q.id));

      const toDelete = existing.filter((q) => !keepIds.has(q.id));
      if (toDelete.length) await this.questionRepo.remove(toDelete);

      await this.questionRepo.save(
        questions.map((q) =>
          this.questionRepo.create({ ...q, vacancy_id: id }),
        ),
      );
    }

    return this.vacanciesRepository.findById(id);
  }

  async getVacancies(query: VacanciesQueryDto) {
    return paginatedResponse(
      'vacancies',
      await this.vacanciesRepository.findAllPaginated(query),
    );
  }

  async getApplications(vacancyId: string, query: ApplicationsQueryDto) {
    await this.getVacancyOrFail(vacancyId);

    const { items, total, page, limit, totalPages } =
      await this.applicationsRepository.findByVacancyPaginated(
        vacancyId,
        query,
      );

    for (const app of items) {
      if (app.user?.cv_file_key) {
        (app as ApplicationWithCvUrl).cv_url =
          `${process.env.FRONTEND_URL || 'http://localhost:3000'}/${app.id}/cv`;
      }
    }

    return {
      data: items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async updateApplicationStatus(
    id: string,
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED',
    message?: string,
  ) {
    // Load with user so we have the email ready for the decision email — no second query later.
    const application = await this.applicationsRepository.findByIdWithUser(id);
    if (!application) {
      throw new NotFoundException(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
    }

    // A decision is final: once accepted or rejected, it can't be changed.
    // This also guarantees the applicant never gets two emails.
    if (application.status !== 'PENDING') {
      throw new BadRequestException(
        `This application was already ${application.status.toLowerCase()} and can't be changed.`,
      );
    }

    // PENDING -> PENDING: nothing to do
    if (status === 'PENDING') {
      return application;
    }

    application.status = status;
    const saved = await this.applicationsRepository.save(application);

    await this.sendDecisionEmail(application, status, message);

    return saved;
  }

  private async sendDecisionEmail(
    application: Application & { user?: { email?: string; name?: string } },
    status: 'ACCEPTED' | 'REJECTED',
    message?: string,
  ) {
    // The decision is already saved, so a mail problem must never fail the request
    try {
      if (!application?.user?.email) {
        this.logger.warn(`No email found for application ${application.id}`);
        return;
      }

      const vacancy = await this.vacanciesRepository.findById(
        application.vacancy_id,
      );

      await this.mailService.sendRecruitmentResultEmail(
        application.user.email,
        {
          name: application.user.name,
          decision: status === 'ACCEPTED' ? 'accepted' : 'rejected',
          vacancyTitle: vacancy?.title,
          society: vacancy?.society,
          message,
        },
      );
      this.logger.log(`Sent ${status} email for application ${application.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to send ${status} email for application ${application.id}`,
        error as Error,
      );
    }
  }

  async exportApplicationsToExcel(
    vacancyId: string,
    startDate?: string,
    endDate?: string,
    search?: string,
  ) {
    // Loads questions via relations ['category', 'questions']; 404s if missing
    const vacancy = await this.getVacancyOrFail(vacancyId);

    const all = await this.applicationsRepository.findByVacancy(vacancyId, {
      startDate,
      endDate,
      search,
    });

    // One row per applicant (list is newest-first, so we keep the latest)
    const seenUsers = new Set<string>();
    const applications = all.filter((app) => {
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
        created_at: app.created_at.toISOString().replace('T', ' ').slice(0, 19),
        updated_at: app.updated_at.toISOString().replace('T', ' ').slice(0, 19),
        name: safeCell(u?.name),
        username: safeCell(u?.username),
        email: safeCell(u?.email),
        phone: safeCell(u?.phone),
        university: safeCell(u?.university),
        faculty: safeCell(u?.faculty),
        major: safeCell(u?.major),
        academic_year: u?.academic_year ?? '',
        bio: safeCell(u?.bio),
        cv: u?.cv_file_key
          ? {
              text: 'View CV',
              hyperlink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/${app.id}/cv`,
            }
          : '',
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
    const header = sheet.getRow(1);
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    header.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF00529B' },
    };
    header.alignment = { vertical: 'middle', wrapText: true };
    header.height = 24;
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    if (sheet.columnCount > 0) {
      sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: sheet.columnCount },
      };
    }
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

  async deleteVacancy(id: string) {
    const vacancy = await this.getVacancyOrFail(id);
    await this.vacanciesRepository.remove(vacancy);
    return { success: true };
  }

  async getApplicationCv(id: string) {
    const application = await this.applicationsRepository.findByIdWithUser(id);
    if (!application) {
      throw new NotFoundException(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
    }
    if (!application.user?.cv_file_key) {
      throw new NotFoundException('CV file not found for this user');
    }
    return this.storageService.getFile(application.user.cv_file_key);
  }

  private async getVacancyOrFail(id: string) {
    const vacancy = await this.vacanciesRepository.findById(id);
    if (!vacancy) {
      throw new NotFoundException(ERROR_MESSAGES.VACANCY_NOT_FOUND);
    }
    return vacancy;
  }

  async uploadVacancyImage(id: string, image: any) {
    const vacancy = await this.getVacancyOrFail(id);

    if (!image) {
      throw new BadRequestException('Image is required');
    }

    const previousPublicId = vacancy.image_public_id;
    const uploaded = await this.mediaService.uploadImage(
      image,
      VACANCIES_MEDIA_FOLDER,
    );

    vacancy.image_url = uploaded.url;
    vacancy.image_public_id = uploaded.public_id;

    const saved = await this.vacanciesRepository.save(vacancy);

    if (previousPublicId) {
      await this.mediaService.deleteImage(previousPublicId);
    }

    return saved;
  }

  async removeVacancyImage(id: string) {
    const vacancy = await this.getVacancyOrFail(id);

    if (!vacancy.image_public_id) {
      throw new NotFoundException('No image found for this vacancy');
    }

    const publicId = vacancy.image_public_id;
    vacancy.image_url = null;
    vacancy.image_public_id = null;

    await this.vacanciesRepository.save(vacancy);
    await this.mediaService.deleteImage(publicId);

    return vacancy;
  }

  async downloadApplicationFile(fileKey: string, res: any) {
    const normalizedKey = path.posix.normalize(fileKey);

    if (
      !normalizedKey.startsWith('applications/') ||
      normalizedKey.includes('..')
    ) {
      throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN_ACTION);
    }
    try {
      const file = await this.storageService.getFile(normalizedKey);
      res.set({
        'Content-Type': file.contentType,
        'Content-Length': file.size,
        'Content-Disposition': `inline; filename="${fileKey.split('/').pop()}"`,
      });
      res.send(file.fileBuffer);
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException('File not found');
      }
      throw new InternalServerErrorException('Failed to download file');
    }
  }
}
