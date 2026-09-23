import { InternalServerErrorException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

const VACANCIES_MEDIA_FOLDER = resolveMediaFolder(
  'VACANCIES_IMAGES_FILE_NAME',
  'vacancies',
);

/** `cv_url` is derived per-request, not a mapped column on the entity. */
type ApplicationWithCvUrl = Application & { cv_url?: string };

@Injectable()
export class AdminRecruitmentService {
  constructor(
    private readonly vacanciesRepository: VacanciesRepository,
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly storageService: StorageService,
    private readonly mediaService: MediaService,
  ) {}

  async createVacancy(dto: CreateVacancyDto) {
    const vacancy = this.vacanciesRepository.create(dto);
    return this.vacanciesRepository.save(vacancy);
  }

  async updateVacancy(id: string, dto: UpdateVacancyDto) {
    const vacancy = await this.vacanciesRepository.preload({ id, ...dto });
    if (!vacancy) {
      throw new NotFoundException(ERROR_MESSAGES.VACANCY_NOT_FOUND);
    }
    return this.vacanciesRepository.save(vacancy);
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
  ) {
    const application = await this.applicationsRepository.findById(id);
    if (!application) {
      throw new NotFoundException(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
    }
    application.status = status;
    return this.applicationsRepository.save(application);
  }

  async exportApplicationsToExcel(
    vacancyId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const vacancy = await this.getVacancyOrFail(vacancyId);

    const applications = await this.applicationsRepository.findByVacancy(
      vacancyId,
      { startDate, endDate },
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Applications');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'User Name', key: 'name', width: 30 },
      { header: 'User Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'University', key: 'university', width: 25 },
      { header: 'Faculty', key: 'faculty', width: 25 },
      { header: 'Major', key: 'major', width: 25 },
      { header: 'Academic Year', key: 'academic_year', width: 15 },
      { header: 'CV Link (Key)', key: 'cv_file_key', width: 30 },
      { header: 'Extra Data', key: 'extra_data', width: 50 },
      { header: 'Applied At', key: 'created_at', width: 25 },
    ];

    for (const app of applications) {
      let cvLink: string | ExcelJS.CellHyperlinkValue = 'N/A';
      if (app.user?.cv_file_key) {
        const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/${app.id}/cv`;
        cvLink = { text: 'View CV', hyperlink: url };
      }

      worksheet.addRow({
        id: app.id,
        status: app.status,
        name: app.user?.name || 'N/A',
        email: app.user?.email || 'N/A',
        phone: app.user?.phone || 'N/A',
        university: app.user?.university || 'N/A',
        faculty: app.user?.faculty || 'N/A',
        major: app.user?.major || 'N/A',
        academic_year: app.user?.academic_year || 'N/A',
        cv_file_key: cvLink,
        extra_data: app.extra_data ? JSON.stringify(app.extra_data) : '',
        created_at: app.created_at.toISOString(),
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return {
      fileBuffer: Buffer.from(buffer as ArrayBuffer),
      fileName: `applications-${vacancy.title.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`,
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
    try {
      const file = await this.storageService.getFile(fileKey);
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
